import SortedSet from "../../../../../app/services/mem_db/datastructures/sorted_set.js";

describe("SortedSet", () => {
  it("sets and gets", () => {
    const sortedSet = new SortedSet();

    // Set starts off empty
    assert.strictEqual(sortedSet.get("0"), null);

    sortedSet.set("0", "Hello world").set("1", "Goodbye world");

    assert.strictEqual(sortedSet.get("0"), "Hello world");
    assert.strictEqual(sortedSet.get("1"), "Goodbye world");
  });

  it("gets by range", () => {
    const sortedSet = new SortedSet();

    assert.deepStrictEqual(sortedSet.getByRange("000", "100"), []);

    sortedSet.set("001", "B").set("000", "A").set("002", "C");

    assert.deepStrictEqual(sortedSet.getByRange("000", "100"), [
      ["000", "A"],
      ["001", "B"],
      ["002", "C"],
    ]);

    assert.deepStrictEqual(sortedSet.getByRange("000", "001"), [
      ["000", "A"],
      ["001", "B"],
    ]);

    assert.deepStrictEqual(sortedSet.getByRange("002", "002"), [["002", "C"]]);
  });

  it("deletes", () => {
    const sortedSet = new SortedSet();

    assert.strictEqual(sortedSet.delete("0"), false);

    sortedSet.set("0", "A");

    assert.strictEqual(sortedSet.delete("0"), true);
    assert.strictEqual(sortedSet.delete("0"), false);
  });

  it("deletes by range", () => {
    const sortedSet = new SortedSet();

    assert.deepStrictEqual(sortedSet.deleteByRange("000", "100"), []);

    sortedSet.set("001", "B").set("000", "A").set("002", "C");

    // Delete element with score 001 and it should not appear
    assert.deepStrictEqual(sortedSet.deleteByRange("000", "000"), [
      ["000", "A"],
    ]);
    assert.strictEqual(sortedSet.get("000"), null);
    assert.deepStrictEqual(sortedSet.getByRange("000", "100"), [
      ["001", "B"],
      ["002", "C"],
    ]);

    // Delete all remaining elements
    assert.deepStrictEqual(sortedSet.deleteByRange("000", "100"), [
      ["001", "B"],
      ["002", "C"],
    ]);
  });

  it("generates undo commands", () => {
    const sortedSet = new SortedSet();

    sortedSet.set("001", "B").set("000", "A").set("002", "C");

    // Runs an operation and its corresponding undo operation. Verfies that the
    // undo restores it back to the original state.
    const runTest = (operation, args) => {
      const undo = sortedSet.undoCommand(operation, ...args);

      sortedSet[operation](...args);

      undo.execute();

      assert.deepStrictEqual(sortedSet.getByRange("000", "100"), [
        ["000", "A"],
        ["001", "B"],
        ["002", "C"],
      ]);
    };

    const tests = [
      ["set", ["020", "D"]],
      ["get", ["000"]],
      ["getByRange", ["000", "100"]],
      ["delete", ["000"]],
      ["deleteByRange", ["000", "100"]],
    ];

    tests.forEach((test) => {
      runTest(...test);
    });

    // Raises error for unrecgonized operation
    assert.throws(() => {
      sortedSet.undoCommand("invalid", "key");
    }, new Error("Unrecognized operation invalid for SortedSet"));
  });
});
