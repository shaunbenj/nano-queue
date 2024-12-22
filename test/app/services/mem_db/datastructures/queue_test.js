import Queue from "../../../../../app/services/mem_db/datastructures/queue.js";

describe("Queue", () => {
  it("creates an ordered queue", () => {
    const queue = new Queue();

    // Push data into queue
    queue.leftPush(1);
    queue.rightPush(2);

    // Verify data is ordered correctly
    assert.strictEqual(queue.rightPop(), 2);
    assert.strictEqual(queue.leftPop(), 1);
    assert.strictEqual(queue.rightPop(), null);
    assert.strictEqual(queue.leftPop(), null);

    // Works with batch data
    queue.leftBatchPush([1, 2, 3]);
    assert.deepStrictEqual(queue.rightBatchPop(3), [1, 2, 3]);

    queue.rightBatchPush([1, 2, 3]);
    assert.deepStrictEqual(queue.leftBatchPop(3), [1, 2, 3]);
  });
});
