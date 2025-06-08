import DatabaseClient from "./database_client.js";
import { UUID, serializeDate, secondsFromNow } from "../../../lib/utils.js";
import { v4 } from "uuid";
import { Worker } from "node:worker_threads";

class QueueItem {
  constructor(
    queueName,
    payload,
    id = v4(),
    createdAt = new Date().toISOString(),
    retries = 0,
    visibleAt = null
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.payload = payload;
    this.queueName = queueName;
    this.retries = retries; // Number of times this item has retried
    // When the item will become visible for processing. Set if the item is
    // currently being processed.
    this.visibleAt = visibleAt;
  }

  toJSON() {
    return JSON.stringify({
      id: this.id,
      createdAt: this.createdAt,
      payload: this.payload,
      queueName: this.queueName,
      retries: this.retries,
      visibleAt: this.visibleAt,
    });
  }

  static fromJSON(instance) {
    const obj = JSON.parse(instance);
    return new QueueItem(
      obj.queueName,
      obj.payload,
      obj.id,
      obj.createdAt,
      obj.retries,
      obj.visibleAt
    );
  }
}

export class Queue {
  constructor(name, visibilityTimeout = 30, maxRetries = 3) {
    // name: Queue name
    this.name = name;
    // visibilityTimeout: Amount of time a message remains invisible while
    // being processed in seconds
    this.visibilityTimeout = visibilityTimeout;
    // Number of times an item can be retried before being moved to dlq
    this.maxRetries = maxRetries;
    // Queue used to hold items while they are being processed / invisible
    this.processingQueue = `${name}_processing`;
    // Queue to hold items once they hit the max number of retries
    this.deadLetterQueue = `${name}_dlq`;
    // KeyValue store to map an item's ID to its sort key field in the
    // processing queue
    this.idToSortKeyMap = `${name}_id_to_sort_key`;
  }

  toJSON() {
    return JSON.stringify({
      name: this.name,
      visibilityTimeout: this.visibilityTimeout,
      // Number of times an item can be retried before being moved to dlq
      maxRetries: this.maxRetries,
      // Queue used to hold items while they are being processed / invisible
      processingQueue: this.processingQueue,
      // Queue to hold items once they hit the max number of retries
      deadLetterQueue: this.deadLetterQueue,
      // KeyValue store to map an item's ID to its sort key field in the
      // processing queue
      idToSortKeyMap: this.idToSortKeyMap,
    });
  }

  static fromJSON(instance) {
    const obj = JSON.parse(instance);
    return new Queue(
      obj.name,
      obj.visibilityTimeout,
      obj.maxRetries,
      obj.processingQueue,
      obj.deadLetterQueue,
      obj.idToSortKeyMap
    );
  }
}

export default class QueueService {
  constructor(
    databaseClient = new DatabaseClient(),
    retryWorker = new Worker("./app/services/queue/retry_worker.js")
  ) {
    this.databaseClient = databaseClient;
    this.queues = [];
    this.retryWorker = retryWorker;

    this.retryWorker.on("exit", (code) => {
      throw new Error(`Retry worker failed with error code ${code}`);
    });
  }

  async createQueue(queueName) {
    if (this.queues.some((q) => q.name === queueName)) {
      throw new Error(`Queue ${queueName} already exists`);
    }

    const queue = new Queue(queueName);

    const script = `
    memDB.create("Queue", "${queue.name}")
    memDB.create("SortedSet", "${queue.processingQueue}")
    memDB.create("KeyValue", "${queue.idToSortKeyMap}")
    memDB.create("Queue", "${queue.deadLetterQueue}")
    `;

    // Create necessary datastructures in the database to track queue state
    await this.databaseClient.execute(script);

    // Register the queue with the retry thread
    await this.retryWorker.postMessage({
      name: "registerQueue",
      queue: queue.toJSON(),
    });

    this.queues.push(queue);
  }

  async pushItem(queueName, payload) {
    const queue = this.queues.find((q) => q.name === queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    const item = new QueueItem(queue.name, payload);

    const script = `
    memDB.execute("${queue.name}", "leftPush", ${JSON.stringify(item)})
    `;

    await this.databaseClient.execute(script);

    return item.id;
  }

  async popItem(queueName) {
    const queue = this.queues.find((q) => q.name === queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    const visibleAt = serializeDate(secondsFromNow(queue.visibilityTimeout));

    const script = `
    local serializedItem = memDB.execute("${queue.name}", "rightPop")

    if serializedItem == "null" then
      return "null" 
    end

    -- Deserialize item and set visibleAt
    local item = JSON.parse(serializedItem)
    item.visibleAt = "${visibleAt}"
    local updatedItem = JSON.stringify(item)

    -- Compute sort key
    local sortKey = "${visibleAt}/" .. item.id

    -- Reserialize item and set its score to be sort key
    memDB.execute("${queue.processingQueue}", "set", sortKey, updatedItem)

    -- Store ID to sort key mapping
    memDB.execute("${queue.idToSortKeyMap}", "set", item.id, sortKey)

    return updatedItem
    `;

    const response = await this.databaseClient.execute(script);

    if (response.data === null) return null;

    return QueueItem.fromJSON(response.data);
  }

  // Marks an item in the queue as complete
  async deleteItem(queueName, id) {
    const queue = this.queues.find((q) => q.name === queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    const script = `
    -- Get SortKey to delete from the processing queue
    local sortKey = memDB.execute("${queue.idToSortKeyMap}", "get", "${id}")
    
    -- Return false if we could not find the SortKey for the ID. This can
    -- happen if the item has been reprocessed with a different SortKey
    if sortKey == "null" then return false end
    
    -- Returns true if the item was deleted false otherwise
    return memDB.execute("${queue.processingQueue}", "delete", sortKey)
    `;

    const response = await this.databaseClient.execute(script);

    return response.data;
  }
}
