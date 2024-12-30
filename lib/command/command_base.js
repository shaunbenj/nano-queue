export default class CommandBase {
  constructor() {
    if (new.target == CommandBase) {
      throw new Error("CommandBase class cannot be instantiated directly");
    }
  }

  execute() {
    throw new Error("Method 'execute' must be implemented");
  }
}
