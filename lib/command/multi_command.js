import CommandBase from "./command_base.js";

export default class MultiCommand extends CommandBase {
  constructor(commands = []) {
    super();

    this.commands = commands;
  }

  execute() {
    for (const command of this.commands) {
      command.execute();
    }
  }
}
