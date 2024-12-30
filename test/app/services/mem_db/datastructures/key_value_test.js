import KeyValue from "../../../../../app/services/mem_db/datastructures/key_value.js";

describe("KeyValue", () => {
  it("works", () => {
    const store = new KeyValue();

    assert.strictEqual(store.get("myKey"), null);

    assert.strictEqual(store.set("myKey", "myValue"), true);
    assert.strictEqual(store.get("myKey"), "myValue");

    // Raises error when incrementing a non number value
    assert.throws(() => {
      store.incr("myKey", 1);
    }, new Error("KeyValue: Failed to convert myValue to number"));

    assert.strictEqual(store.set("myKey", 1), true);
    assert.strictEqual(store.incr("myKey", 10), true);
    assert.strictEqual(store.get("myKey"), 11);
  });

  it("generates undo commands", () => {
    const store = new KeyValue();

    // Undoes set
    let undo = store.undoCommand("set", "myKey", "myValue");

    store.set("myKey", "myValue");

    undo.execute();

    assert.strictEqual(store.get("myKey"), null);

    // Undoes get by executing a noop
    store.set("myKey", "myValue");

    undo = store.undoCommand("get", "myKey");

    store.get("myKey");

    undo.execute();

    assert.strictEqual(store.get("myKey"), "myValue");

    // Undoes incr
    store.set("numKey", 10);

    undo = store.undoCommand("incr", "numKey", 1);

    store.incr("numKey", 1);

    undo.execute();

    assert.strictEqual(store.get("numKey"), 10);

    // Raises error for unrecgonized operation
    assert.throws(() => {
      store.undoCommand("invalid", "key");
    }, new Error("Unrecognized operation invalid for KeyValue"));
  });
});
