import { LuaFactory } from "wasmoon";
import Queue from "./datastructures/queue.js";

export class TransactionManager {
  constructor(db = new Queue()) {
    this.db = db;
  }

  execute(command, ...inputArgs) {
    let undoStack = [];

    // Verify the command can be executed
    if (typeof this.db[command] != "function") {
      throw new Error(`Unrecognized command ${command}`);
    }

    try {
      // Execute the command
      const returnVal = this.db[command](...inputArgs);

      // Save the command and its response in case we need to rollback
      undoStack.push({
        command: command,
        inputArgs: inputArgs,
        returnVal: returnVal,
      });

      return returnVal;
    } catch (executeError) {
      console.log(`Error occurred during a transaction. Error ${executeError}`);
      console.log("Rolling back transaction...");

      this.rollback(undoStack);

      console.log("Rolled back successfully!");

      throw new Error(`Rolled back from error ${executeError}`);
    }
  }

  rollback(undoStack) {
    try {
      // Undo each command one by one
      while (undoStack.length > 0) {
        const undoLog = undoStack.pop();
        this.db.undoCommand(
          undoLog.command,
          undoLog.inputArgs,
          undoLog.returnVal
        );
      }
    } catch (error) {
      console.log(`Error while rolling back: ${error}`);

      throw new Error(`Failed to rollback: ${error}`);
    }
  }
}

class LuaExecutor {
  constructor() {
    this.lua = null;
  }

  // Pass in an array of object with name and value properties
  static async create() {
    const instance = new LuaExecutor();
    instance.factory = new LuaFactory();
    instance.lua = await instance.factory.createEngine();

    return instance;
  }

  registerGlobal(name, global) {
    this.lua.global.set(name, global);
  }

  execute(script) {
    if (this.lua == null) {
      throw new Error("LuaEngine is not initialized. Call init() first.");
    }

    return this.lua.doStringSync(script);
  }

  async getGlobal(name) {
    return await this.lua.global.get(name);
  }
}

const luaExecutor = await LuaExecutor.create();
export default luaExecutor;
