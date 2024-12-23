import DoublyLinkedList from "../../../../lib/doubly_linked_list.js";

export default class Queue {
  constructor(list = new DoublyLinkedList()) {
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

  leftPop() {
    return this.list.popHead();
  }

  leftBatchPop(n) {
    return this.list.popHeadBatch(n);
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
}
