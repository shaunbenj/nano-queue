import { Mutex } from "async-mutex";
import LuaExecutor from "../../../lib/lua_executor.js";
import MemDB from "./mem_db.js";

class DatabaseWrapper {
  constructor(database) {
    this.database = database;
    this.undoStack = [];
  }
}

// Allows executing scripts against the database with rollback capability
export default class ScriptExecutor {
  constructor(
    database = new MemDB(),
    executor = new LuaExecutor(),
    mutex = new Mutex()
  ) {
    this.executor = executor;
    this.databaseWrapper = new DatabaseWrapper(database);
    this.mutex = mutex;

    // Wrapper around the databse track undo commands
    this.dbProxy = new Proxy(this.databaseWrapper, {
      get(target, prop) {
        const database = target.database;
        const undoStack = target.undoStack;

        if (typeof database[prop] === "function") {
          return function (...args) {
            const undo = database["undoCommand"].apply(database, [
              prop,
              ...args,
            ]);

            target.undoStack.push(undo);

            // Wasmoon has a bug where it can't handle null value's so we escape
            // it to a string here
            const val = database[prop].apply(database, args);
            if (val === null || val === undefined) {
              return "null";
            } else {
              return val;
            }
          };
        }

        return database[prop];
      },
    });
  }

  async execute(script) {
    // Initialize Lua VM
    await this.executor.initialize();

    // Register ScriptExecutor as memDB. ScriptExecutor is a wrapper around the
    // the db instance
    this.executor.registerGlobal("memDB", this.dbProxy);

    // Register console as a logger
    this.executor.registerGlobal("Logger", {
      log: (str) => console.log(str),
    });

    // Register JSON to serialize / deserialize JSON strings
    this.executor.registerGlobal("JSON", {
      parse: (str) => JSON.parse(str),
      stringify: (obj) => JSON.stringify(obj),
    });

    // Lock executor to prevent multiple scripts from running at the same time
    return this.mutex.runExclusive(async () => {
      try {
        const result = this.executor.execute(script);

        // Handle buggy wasmoon behavior
        if (result == "null") {
          return null;
        }

        // console.log(`Script execution result ${result}`);

        return result;
      } catch (error) {
        console.log(`Error while running script: ${error}`);
        // Rollback
        this.databaseWrapper.undoStack.reverse();

        for (const undoCommand of this.databaseWrapper.undoStack) {
          undoCommand.execute();
        }
        console.log("Rolled back successfully");

        // Re-throw the error
        throw new Error(
          `Error while executing script ${error.message}. Rolled back successfully`
        );
      } finally {
        // Reset undoStack
        this.databaseWrapper.undoStack = [];
      }
    });
  }
}
