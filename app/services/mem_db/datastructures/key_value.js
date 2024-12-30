import Command from "../../../../lib/command/command.js";
import Base from "./base.js";

export default class KeyValue extends Base {
  constructor(map = new Map()) {
    super();
    this.map = map;
  }

  set(key, value) {
    this.map.set(key, value);

    return true;
  }

  get(key) {
    return this.map.get(key) || null;
  }

  incr(key, by = 1) {
    const value = this.get(key);
    let num = Number(value);

    if (isNaN(num)) {
      throw new Error(`KeyValue: Failed to convert ${value} to number`);
    }

    return this.set(key, num + by);
  }

  undoCommand(operation, ...args) {
    if (operation == "set") {
      return new Command(this, "set", args[0], this.get(args[0]));
    } else if (operation == "get") {
      return Command.noop();
    } else if (operation == "incr") {
      return new Command(this, "set", args[0], this.get(args[0]));
    } else {
      throw new Error(`Unrecognized operation ${operation} for KeyValue`);
    }
  }
}
