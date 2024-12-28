import { Mutex } from "async-mutex";
import MemDb from "./mem_db";

class Command {
  constructor(operation, ...inputArgs) {
    this.operation = operation;
    this.inputArgs = inputArgs;
  }
}

class Transaction {
  constructor(id, db = new MemDb(), mutex = new Mutex()) {
    this.id = id;
    this.db = db;
    this.mutex = mutex; // Used to enforce serial execution of transactions
    this.undoStack = []; // Used to recover from failures within a transaction
  }

  async run(commands = [new Command()]) {
    // Lock the database
    this.mutex.runExclusive(async () => {
      // Execute each command
      try {
        for (const command of commands) {
          await this.db[command.operation](command.inputArgs);

          this.undoStack.push(command);
        }
      } catch (error) {
        console.log(`Error occured during transaction ${this.id}: ${error}`);
        console.log(`Rolling back...`);

        await this.rollback();

        console.log(`Rolled back successfully!`);

        throw new Error(
          `Error occured during transaction ${this.id}: ${error}. Rolled back successfully.`
        );
      }
    });
  }

  async rollback() {
    for (const command of undoStack.reverse()) {
      await this.db[command.operation](command.inputArgs);
    }
  }
}

export default class TransactionManager {
  constructor() {
    this.transactionLog = []; // Can be used to recreate the db for recovery
  }
}
