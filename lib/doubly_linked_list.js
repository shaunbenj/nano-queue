class Node {
  constructor(data = null, next = null, prev = null) {
    this.data = data;
    this.next = next;
    this.prev = prev;
  }
}

export default class DoublyLinkedList {
  constructor() {
    this.head = new Node(null);
    this.tail = new Node(null);

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  insertHead(data) {
    const node = new Node(data, this.head.next, this.head);
    this.head.next = node;
    node.next.prev = node;

    return this;
  }

  insertHeadBatch(dataArray) {
    dataArray.forEach((element) => {
      this.insertHead(element);
    });

    return this;
  }

  insertTail(data) {
    const node = new Node(data, this.tail, this.tail.prev);
    this.tail.prev = node;
    node.prev.next = node;

    return this;
  }

  insertTailBatch(dataArray) {
    dataArray.forEach((element) => {
      this.insertTail(element);
    });

    return this;
  }

  peekHead() {
    // Check if the list is empty
    if (this.head.next == this.tail) {
      return null;
    }

    return this.head.next.data;
  }

  peekTail() {
    // Check if the list is empty
    if (this.head.next == this.tail) {
      return null;
    }

    return this.tail.prev.data;
  }

  popHead() {
    // Check if the list is empty
    if (this.head.next == this.tail) {
      return null;
    }

    // Pop the node in front of head
    const poppedNode = this.head.next;
    this.head.next = poppedNode.next;
    poppedNode.next.prev = this.head;

    return poppedNode.data;
  }

  popHeadBatch(n) {
    if (n < 0) {
      throw new Error(`Invalid n ${n} for popHeadBatch`);
    }

    let dataArray = [];

    for (let i = 0; i < n; i++) {
      const data = this.popHead();

      if (data != null) {
        dataArray.push(data);
      } else {
        return dataArray;
      }
    }

    return dataArray;
  }

  popTail() {
    // Check if the list is empty
    if (this.head.next == this.tail) {
      return null;
    }

    // Pop the node behind tail
    const poppedNode = this.tail.prev;
    this.tail.prev = poppedNode.prev;
    poppedNode.prev.next = this.tail;

    return poppedNode.data;
  }

  popTailBatch(n) {
    if (n < 0) {
      throw new Error(`Invalid n ${n} for popTailBatch`);
    }

    let dataArray = [];

    for (let i = 0; i < n; i++) {
      const data = this.popTail();

      if (data != null) {
        dataArray.push(data);
      } else {
        return dataArray;
      }
    }

    return dataArray;
  }
}
