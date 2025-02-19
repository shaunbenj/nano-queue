import DatabaseClient from "./database_client.js";
import { v4 } from "uuid";

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

class Queue {
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
  }
}

export default class QueueService {
  constructor(databaseClient = new DatabaseClient()) {
    this.databaseClient = databaseClient;
    this.queues = [];
  }

  async createQueue(queueName) {
    if (this.queues.some((q) => q.name === queueName)) {
      throw new Error(`Queue ${queueName} already exists`);
    }

    const queue = new Queue(queueName);

    const script = `
    memDB.create("Queue", "${queue.name}")
    memDB.create("SortedSet", "${queue.processingQueue}")
    memDB.create("Queue", "${queue.deadLetterQueue}")
    `;

    await this.databaseClient.execute(script);

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

    console.log(script);

    await this.databaseClient.execute(script);

    return item.id;
  }

  async popItem(queueName) {
    const queue = this.queues.find((q) => q.name === queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    const visibleAt = new Date(
      Date.now() + queue.visibilityTimeout * 1_000
    ).toISOString();

    const script = `
    local serializedItem = memDB.execute("${queue.name}", "rightPop")

    -- Deserialize item and set visibleAt
    local item = JSON.parse(serializedItem)
    item.visibleAt = "${visibleAt}"
    local updatedItem = JSON.stringify(item)

    -- Reserialize item and set its score to be visibleAt
    memDB.execute("${queue.processingQueue}", "set", "${visibleAt}", updatedItem)

    return updatedItem
    `;

    const response = await this.databaseClient.execute(script);

    console.log(response);

    return QueueItem.fromJSON(response.data);
  }
}
