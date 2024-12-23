import KeyValue from "../../../../app/services/mem_db/datastructures/key_value.js";
import MemDb from "../../../../app/services/mem_db/mem_db.js";

describe("MemDb", () => {
  it("creates named datastructures", async () => {
    const memDb = new MemDb();

    await memDb.create("KeyValue", "myMap");

    assert.strictEqual(memDb.dsLookup.get("myMap") instanceof KeyValue, true);

    // Raises error if name is already in use
    assert.rejects(async () => {
      memDb.create("KeyValue", "myMap");
    }, new Error("Name myMap is already in use"));

    // Raises error if the datastructure type is unrecognized
    assert.rejects(async () => {
      memDb.create("Invalid", "myMap");
    }, new Error("Unrecognized datastructure type Invalid"));
  });

  it("executes commands", async () => {
    const memDb = new MemDb();

    memDb.create("KeyValue", "myMap");

    memDb.execute("myMap", "set", "myKey", "myValue");

    assert.strictEqual(await memDb.execute("myMap", "get", "myKey"), "myValue");

    // Raises error if datastructure name is missing
    assert.rejects(async () => {
      memDb.execute("missing", "set", "myKey", "myValue");
    }, new Error("Missing datastructure for missing"));
  });

  it("prevents race conditions", async () => {
    // Create a custom key value store with a slow async set and fast set
    // operation
    class SlowKeyValue {
      constructor() {
        this.map = new Map();
      }

      // Sets a value after a delay of 1s
      async slowSet(key, value) {
        return new Promise((resolve) =>
          setTimeout(() => {
            this.map.set(key, value);
            resolve();
          }, 200)
        );
      }

      // Sets value immediately
      fastSet(key, value) {
        return this.map.set(key, value);
      }

      get(key, value) {
        return this.map.get(key);
      }
    }

    const memDb = new MemDb({
      SlowKeyValue,
    });

    memDb.create("SlowKeyValue", "myKeyValue");

    const slowSet = memDb.execute(
      "myKeyValue",
      "slowSet",
      "myKey",
      "slowValue"
    );
    const fastSet = memDb.execute(
      "myKeyValue",
      "fastSet",
      "myKey",
      "fastValue"
    );

    await Promise.all([slowSet, fastSet]);

    assert.strictEqual(
      await memDb.execute("myKeyValue", "get", "myKey"),
      "fastValue"
    );
  });
});
