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
});
