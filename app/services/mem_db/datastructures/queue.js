import Command from "../../../../lib/command/command.js";
import DoublyLinkedList from "../../../../lib/doubly_linked_list.js";
import Base from "./base.js";

export default class Queue extends Base {
  constructor(list = new DoublyLinkedList()) {
    super();
    this.list = list;
  }

  leftPush(data) {
    this.list.insertHead(data);
  }

  leftBatchPush(dataArray) {
    if (dataArray.constructor.name != "Array") {
      throw new Error(`leftBatchPush expects an array, got ${dataArray}`);
    }

    this.list.insertHeadBatch(dataArray);
  }

  leftPeek() {
    return this.list.peekHead();
  }

  leftPop() {
    return this.list.popHead();
  }

  leftBatchPop(n) {
    return this.list.popHeadBatch(n);
  }

  rightPeek() {
    return this.list.peekTail();
  }

  rightPush(data) {
    this.list.insertTail(data);
  }

  rightBatchPush(dataArray) {
    if (dataArray.constructor.name != "Array") {
      throw new Error(`rightBatchPush expects an array, got ${dataArray}`);
    }

    this.list.insertTailBatch(dataArray);
  }

  rightPop() {
    return this.list.popTail();
  }

  rightBatchPop(n) {
    return this.list.popTailBatch(n);
  }

  undoCommand(operation, ...args) {
    if (operation == "leftPush") {
      return new Command(this, "leftPop");
    } else if (operation == "leftBatchPush") {
      return new Command(this, "leftBatchPop", args[0].length);
    } else if (operation == "leftPeek") {
      return Command.noop();
    } else if (operation == "leftPop") {
      return new Command(this, "leftPush", this.leftPeek());
    } else if (operation == "leftBatchPop") {
      const poppedValues = this.list.batchPeekHead(args[0]);

      // Skipping deep copy as primitive types including strings are copy by
      // value
      return new Command(this, "leftBatchPush", poppedValues.reverse());
    } else if (operation == "rightPeek") {
      return Command.noop();
    } else if (operation == "rightPush") {
      return new Command(this, "rightPop");
    } else if (operation == "rightBatchPush") {
      return new Command(this, "rightBatchPop", args[0].length);
    } else if (operation == "rightPop") {
      return new Command(this, "rightPush", this.rightPeek());
    } else if (operation == "rightBatchPop") {
      const poppedValues = this.list.batchPeekTail(args[0]);

      // Skipping deep copy as primitive types including strings are copy by
      // value
      return new Command(this, "rightBatchPush", poppedValues.reverse());
    } else {
      throw new Error(`Unrecognized operation ${operation} for Queue`);
    }
  }
}
