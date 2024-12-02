import SkipList from "../../lib/skip_list.js";

describe("SkipList", () => {
  it("initializes with a head element", () => {
    // Set p to 0 so it always inserts at the bottom most level
    const skipList = new SkipList(0);

    // SkipList should start with an empty head
    const head = skipList.levels[0];
    assert.strictEqual(skipList.levels.length, 1);
    assert.strictEqual(head.score, -Infinity);
    assert.strictEqual(head.down, null);
    assert.strictEqual(head.width, 0);
  });

  it("inserts elements", () => {
    // Set p to 0 so it always inserts at the bottom most level
    const skipList = new SkipList(0);

    // Insert one element
    skipList.insert(1);

    // p is 0 so there should be only level
    assert.strictEqual(skipList.levels.length, 1);

    // Verify only 1 element was inserted
    assert.strictEqual(skipList.levels[0].width, 1);
    assert.notEqual(skipList.levels[0].next, null);
    assert.strictEqual(skipList.levels[0].next.next, null);
    assert.strictEqual(skipList.levels[0].next.prev, skipList.levels[0]);

    // Raises an error if multiple elements with the same score are inserted
    assert.throws(
      () => {
        skipList.insert(1);
      },
      Error,
      "Duplicate node found with the same score"
    );
  });

  it("builds levels", () => {
    // Set p to 1 so that it always adds another level
    const skipList = new SkipList(1);

    // SkipList should start with an empty head
    assert.strictEqual(skipList.levels.length, 1);
    assert.strictEqual(skipList.levels[0].width, 0);

    // Insert one element
    skipList.insert(1);

    // p is 1 so there should now be two levels with one element
    assert.strictEqual(skipList.levels.length, 2);
    assert.strictEqual(skipList.levels[0].width, 1);
    assert.strictEqual(skipList.levels[1].width, 1);

    // Verify the inserted element is correctly set
    for (let level = 0; level < 2; level++) {
      const head = skipList.levels[level];
      const node = head.next;
      assert.strictEqual(node.score, 1);
      assert.strictEqual(node.next, null);
      assert.strictEqual(node.prev, head);
    }

    // Verify that the head element and the node element at the top level point
    // down correctly
    const upperNode = skipList.levels[1].next;
    const lowerNode = skipList.levels[0].next;
    assert.strictEqual(upperNode.down, lowerNode);
    assert.strictEqual(lowerNode.down, null);
  });

  it("gets by score", () => {
    // Set p to 1 so that it always adds another level
    const skipList = new SkipList(1);

    skipList.insert(1).insert(2).insert(3);

    assert.strictEqual(skipList.get(2), true);
    assert.strictEqual(skipList.get(4), false);
    assert.strictEqual(skipList.get(-Infinity), false);
  });

  it("gets by range score", () => {
    // Set p to 1 so that it always adds another level
    const skipList = new SkipList(1);

    skipList.insert(1).insert(2).insert(3);

    assert.deepStrictEqual(skipList.getByRange(2, 3), [2, 3]);
    assert.deepStrictEqual(skipList.getByRange(-Infinity, 2), [1, 2]);
    assert.deepStrictEqual(skipList.getByRange(-Infinity, Infinity), [1, 2, 3]);
  });

  it("deletes by score", () => {
    // Set p to 0 so that the skip list is always one level
    const skipList = new SkipList(0);

    skipList.insert(1).insert(2).insert(3);

    assert.strictEqual(skipList.delete(0), false);

    assert.strictEqual(skipList.delete(2), true);

    assert.strictEqual(skipList.delete(2), false);
  });

  it("deletes by score range", () => {
    // Set p to 1 so that it always adds another level
    const skipList = new SkipList(1);

    skipList.insert(1).insert(2).insert(3);

    // Deleting by a range that contains no elements should not delete anything
    let deleted = skipList.deleteByRange(-Infinity, 0);
    assert.deepStrictEqual(deleted, []);

    // Deleting 2 should leave 1 and 3 behind
    deleted = skipList.deleteByRange(1.5, 2);
    assert.deepStrictEqual(deleted, [2]);
    assert.strictEqual(skipList.levels[0].width, 2);
    assert.strictEqual(skipList.levels[0].next.score, 1);
    assert.strictEqual(skipList.levels[0].next.next.score, 3);

    // Deleting 3 should leave 1 behind
    deleted = skipList.deleteByRange(2.5, 3);
    assert.deepStrictEqual(deleted, [3]);
    assert.strictEqual(skipList.levels[0].width, 1);
    assert.strictEqual(skipList.levels[0].next.score, 1);
    assert.strictEqual(skipList.levels[0].next.next, null);

    // Deleting 1 should leave an empty list
    deleted = skipList.deleteByRange(-Infinity, Infinity);
    assert.deepStrictEqual(deleted, [1]);
    assert.strictEqual(skipList.levels[0].width, 0);
    assert.strictEqual(skipList.levels.length, 1);
  });
});
