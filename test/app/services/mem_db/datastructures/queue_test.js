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

  it("generates undo commands", () => {
    const queue = new Queue();
    queue.leftPush(1);
    queue.rightPush(10);

    // Runs an operation and its corresponding undo operation. Verfies that the
    // undo restores it back to the original state.
    const runTest = (operation, args) => {
      const undo = queue.undoCommand(operation, ...args);

      queue[operation](...args);

      undo.execute();

      assert.strictEqual(queue.leftPeek(), 1);
      assert.strictEqual(queue.rightPeek(), 10);
    };

    const tests = [
      ["leftPush", [2]],
      ["leftBatchPush", [[1, 2, 3]]],
      ["leftPeek", []],
      ["leftPop", []],
      ["leftBatchPop", [3]],
      ["rightPeek", []],
      ["rightPush", [2]],
      ["rightBatchPush", [[2, 3, 4]]],
      ["rightPop", [1]],
      ["rightBatchPop", [3]],
    ];

    tests.forEach((test) => {
      runTest(...test);
    });

    // Raise error for an unrecognzed command
    assert.throws(() => {
      queue.undoCommand("invalid");
    }, new Error("Unrecognized operation invalid for Queue"));
  });
});
