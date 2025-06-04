import { parentPort } from "worker_threads";
import { UUID, serializeDate, secondsFromNow } from "../../../lib/utils.js";
import DatabaseClient from "./database_client.js";
import { Queue } from "./queue_service.js";

// Moves unprocessed items back into the queue
class RetryWorker {
  constructor(databaseClient = new DatabaseClient()) {
    this.databaseClient = databaseClient;
    this.queues = [];
  }

  registerQueue(serializedQueue) {
    const queue = Queue.fromJSON(serializedQueue);
    this.queues.push(queue);

    console.log(`Retry worker regsiter queue ${queue.name}`);
  }

  sleep(seconds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds);
    });
  }

  async run() {
    while (true) {
      // Sleep for 1 second to process incoming messages
      await this.sleep(1);

      for (const queue of this.queues) {
        this.processRetries(queue);
      }
    }
  }

  async processRetries(queue) {
    // Query all the items that need to be retried
    // Move them to the retry queue if the items have not exhausted retry
    // attempts
    // Else move them to DLQ
    const script = `
    local serializedScoreItemPairs = memDB.execute(
      "${queue.processingQueue}", 
      "deleteByRange", 
      "${serializeDate(new Date(0)) + "/" + UUID.MIN_UUID}",
      "${serializeDate(secondsFromNow(0)) + "/" + UUID.MAX_UUID}"
    )

    for _, serializedScoreItemPair in ipairs(serializedScoreItemPairs) do
      Logger.log(serializedScoreItemPair[2])
      local item = JSON.parse(serializedScoreItemPair[2])

      item.retries = item.retries + 1

      if item.retries >= ${queue.maxRetries} then
        Logger.log("Item " .. item.id .. " has reached max retries. Moving to DLQ.")

        memDB.execute("${
          queue.deadLetterQueue
        }", "leftPush", JSON.stringify(item))
      else
        Logger.log("Retrying Item " .. item.id)

        memDB.execute("${queue.name}", "leftPush", JSON.stringify(item))
      end
    end
    `;

    await this.databaseClient.execute(script);
  }
}

const worker = new RetryWorker();

parentPort.on("message", (task) => {
  if (task.name == "registerQueue") {
    worker.registerQueue(task.queue);
  }
});

await worker.run();
/*
    for serializedItem in serializedItems do

      local item = JSON.parse(serializedItem)

      item.retries = item.retries + 1

      if item.retries >= ${queue.maxRetries} then
        Logger.log("Item " .. item.id .. " has reached max retries. Moving to DLQ.")

        memDB.execute("${
          queue.deadLetterQueue
        }", "leftPush", JSON.stringify(item))
      else
        Logger.log("Retrying Item " .. item.id)

        memDB.execute("${queue.name}", "leftPush", JSON.stringify(item))
      end
    end
*/
