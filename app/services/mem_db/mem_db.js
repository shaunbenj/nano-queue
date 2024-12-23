/* 
In memory database that supports the following datastructures:
1. KeyValue
2. Queue
3. SortedSet

Typical usage is as follows:
1. Create a named datastructure using the create API
2. Execute operations on the datastructure using the execute API
*/

import { Mutex } from "async-mutex";
import KeyValue from "./datastructures/key_value.js";
import Queue from "./datastructures/queue.js";
import SortedSet from "./datastructures/sorted_set.js";

export default class MemDb {
  static DEFAULT_REGISTRY = {
    KeyValue,
    Queue,
    SortedSet,
  };

  constructor(dsRegistry = MemDb.DEFAULT_REGISTRY, dsLookup = new Map()) {
    this.dsRegistry = dsRegistry; // Maps datastructure name to its class
    this.dsLookup = dsLookup; // Maps name to a datastructure
    this.mutex = new Mutex();
  }

  async create(type, name) {
    return this.mutex.runExclusive(async () => {
      if (!this.dsRegistry[type]) {
        throw new Error(`Unrecognized datastructure type ${type}`);
      }

      if (this.dsLookup.has(name)) {
        throw new Error(`Name ${name} is already in use`);
      }

      const datastructureClass = this.dsRegistry[type];

      this.dsLookup.set(name, new datastructureClass());
    });
  }

  async execute(name, command, ...args) {
    return this.mutex.runExclusive(async () => {
      if (!this.dsLookup.has(name)) {
        throw new Error(`Missing datastructure for ${name}`);
      }

      const datastructure = this.dsLookup.get(name);

      return datastructure[command](...args);
    });
  }
}
