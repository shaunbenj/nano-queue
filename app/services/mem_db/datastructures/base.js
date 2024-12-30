export default class Base {
  constructor() {
    if (new.target == Base) {
      throw new Error("Base class cannot be instantiated directly");
    }
  }

  // Construts a command to reverse the input operation. Used to rollback
  // changes.
  undoCommand(operation, ...args) {
    throw new Error("Method 'undoCommand' must be implemented");
  }
}
