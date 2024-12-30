import CommandBase from "./command_base.js";

export default class Command extends CommandBase {
  constructor(target, operation, ...args) {
    super();

    this.target = target;
    this.operation = operation;
    this.args = args;
  }

  execute() {
    const fn = Reflect.get(this.target, this.operation);
    return Reflect.apply(fn, this.target, this.args);
  }

  static noop() {
    return new Command(this, "executeNoop");
  }

  static executeNoop() {}
}
