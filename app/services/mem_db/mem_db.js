/* 
In memory database that supports the following datastructures:
1. KeyValue
2. Queue
3. SortedSet

Typical usage is as follows:
1. Create a named datastructure using the create API
2. Execute operations on the datastructure using the execute API
*/

import Command from "../../../lib/command/command.js";
import KeyValue from "./datastructures/key_value.js";
import Queue from "./datastructures/queue.js";
import SortedSet from "./datastructures/sorted_set.js";

export default class MemDB {
  static DEFAULT_REGISTRY = {
    KeyValue,
    Queue,
    SortedSet,
  };

  constructor(dsRegistry = MemDB.DEFAULT_REGISTRY, dsLookup = new Map()) {
    this.dsRegistry = dsRegistry; // Maps datastructure name to its class
    this.dsLookup = dsLookup; // Maps name to a datastructure
  }

  create(type, name) {
    if (!this.dsRegistry[type]) {
      throw new Error(`Unrecognized datastructure type ${type}`);
    }

    if (this.dsLookup.has(name)) {
      throw new Error(`Name ${name} is already in use`);
    }

    const dsClass = this.dsRegistry[type];

    this.dsLookup.set(name, new dsClass());
  }

  execute(name, command, ...args) {
    if (!this.dsLookup.has(name)) {
      throw new Error(`Missing datastructure for ${name}`);
    }

    const datastructure = this.dsLookup.get(name);

    return datastructure[command](...args);
  }

  delete(name) {
    return this.dsLookup.delete(name);
  }

  // Does not support rollback
  register(name, datastructure) {
    this.dsLookup.set(name, datastructure);
  }

  undoCommand(operation, ...args) {
    if (operation == "create") {
      return new Command(this, "delete", args[1]);
    } else if (operation == "delete") {
      const datastructure = this.dsLookup.get(args[0]);

      if (datastructure === undefined) {
        throw new Error(`Datastructure ${args[0]} not found`);
      }

      return new Command(this, "register", args[0], datastructure);
    } else if (operation == "execute") {
      const datastructure = this.dsLookup.get(args[0]);

      if (datastructure === undefined) {
        throw new Error(`Datastructure ${args[0]} not found`);
      }

      return datastructure["undoCommand"](...args.slice(1));
    }
  }
}
