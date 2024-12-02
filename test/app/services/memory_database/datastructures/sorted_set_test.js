import SortedSet from "../../../../../app/services/memory_database/datastructures/sorted_set.js";

describe("SortedSet", () => {
  it("sets and gets", () => {
    const sortedSet = new SortedSet();

    // Set starts off empty
    assert.strictEqual(sortedSet.get(0), null);

    sortedSet.set(0, "Hello world").set(1, "Goodbye world");

    assert.strictEqual(sortedSet.get(0), "Hello world");
    assert.strictEqual(sortedSet.get(1), "Goodbye world");
  });

  it("gets by range", () => {
    const sortedSet = new SortedSet();

    assert.deepStrictEqual(sortedSet.getByRange(-Infinity, Infinity), []);

    sortedSet.set(1, "B").set(0, "A").set(2, "C");

    assert.deepStrictEqual(sortedSet.getByRange(-Infinity, Infinity), [
      [0, "A"],
      [1, "B"],
      [2, "C"],
    ]);

    assert.deepStrictEqual(sortedSet.getByRange(-Infinity, 1), [
      [0, "A"],
      [1, "B"],
    ]);

    assert.deepStrictEqual(sortedSet.getByRange(2, 2), [[2, "C"]]);
  });

  it("deletes", () => {
    const sortedSet = new SortedSet();

    assert.strictEqual(sortedSet.delete(0), false);

    sortedSet.set(-1, "A");

    assert.strictEqual(sortedSet.delete(-1), true);
    assert.strictEqual(sortedSet.delete(-1), false);
  });

  it("deletes by range", () => {
    const sortedSet = new SortedSet();

    assert.deepStrictEqual(sortedSet.deleteByRange(-Infinity, Infinity), []);

    sortedSet.set(-1, "A").set(-2, "B").set(-3, "C");

    // Delete element with score -1 and it should not appear
    assert.deepStrictEqual(sortedSet.deleteByRange(-1, Infinity), [[-1, "A"]]);
    assert.strictEqual(sortedSet.get(-1), null);
    assert.deepStrictEqual(sortedSet.getByRange(-Infinity, Infinity), [
      [-3, "C"],
      [-2, "B"],
    ]);

    // Delete all remaining elements
    assert.deepStrictEqual(sortedSet.deleteByRange(-Infinity, Infinity), [
      [-3, "C"],
      [-2, "B"],
    ]);
  });
});
