import DoublyLinkedList from "../../lib/doubly_linked_list.js";

describe("DoublyLinkedList", () => {
  it("inserts and pops elements", () => {
    const list = new DoublyLinkedList();

    assert.strictEqual(list.peekHead(), null);
    assert.strictEqual(list.peekTail(), null);
    assert.strictEqual(list.popHead(), null);
    assert.strictEqual(list.popTail(), null);

    // Insert elements to the head and tail
    list.insertHead(1).insertTail(2).insertHead(3).insertTail(4);

    assert.strictEqual(list.peekHead(), 3);
    assert.strictEqual(list.peekTail(), 4);

    assert.strictEqual(list.popHead(), 3);
    assert.strictEqual(list.popTail(), 4);

    assert.strictEqual(list.peekHead(), 1);
    assert.strictEqual(list.peekTail(), 2);
  });

  it("batch inserts and pops elements", () => {
    const list = new DoublyLinkedList();

    // Insert elements to the head and tail
    list.insertHeadBatch([1, 2]).insertTailBatch([3, 4]);

    assert.deepStrictEqual(list.popHeadBatch(2), [2, 1]);
    assert.deepStrictEqual(list.popTailBatch(2), [4, 3]);

    assert.deepStrictEqual(list.popHeadBatch(2), []);
    assert.deepStrictEqual(list.popTailBatch(2), []);

    // Raises error if param to batch pop is negative
    assert.throws(() => {
      list.popHeadBatch(-1);
    }, new Error("Invalid n -1 for popHeadBatch"));

    assert.throws(() => {
      list.popTailBatch(-1);
    }, new Error("Invalid n -1 for popTailBatch"));
  });
});
