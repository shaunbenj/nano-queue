import KeyValue from "../../../../app/services/mem_db/datastructures/key_value.js";
import MemDB from "../../../../app/services/mem_db/mem_db.js";

describe("MemDB", () => {
  it("creates named datastructures", () => {
    const memDB = new MemDB();

    memDB.create("KeyValue", "myMap");

    assert.strictEqual(memDB.dsLookup.get("myMap") instanceof KeyValue, true);

    // Raises error if name is already in use
    assert.rejects(async () => {
      memDB.create("KeyValue", "myMap");
    }, new Error("Name myMap is already in use"));

    // Raises error if the datastructure type is unrecognized
    assert.rejects(async () => {
      memDB.create("Invalid", "myMap");
    }, new Error("Unrecognized datastructure type Invalid"));
  });

  it("executes commands", () => {
    const memDB = new MemDB();

    memDB.create("KeyValue", "myMap");

    memDB.execute("myMap", "set", "myKey", "myValue");

    assert.strictEqual(memDB.execute("myMap", "get", "myKey"), "myValue");

    // Raises error if datastructure name is missing
    assert.rejects(() => {
      memDB.execute("missing", "set", "myKey", "myValue");
    }, new Error("Missing datastructure for missing"));
  });

  it("deletes", () => {
    const memDB = new MemDB();

    memDB.create("KeyValue", "myMap");

    assert.strictEqual(memDB.dsLookup.get("myMap") instanceof KeyValue, true);

    memDB.delete("myMap");

    assert.strictEqual(memDB.dsLookup.get("myMap"), undefined);
  });

  it("can rollback create", () => {
    const memDB = new MemDB();

    let undo = memDB.undoCommand("create", "KeyValue", "myMap");

    memDB.create("KeyValue", "myMap");

    assert.strictEqual(memDB.dsLookup.get("myMap") instanceof KeyValue, true);

    // Undoes the myMap creation
    undo.execute();

    assert.strictEqual(memDB.dsLookup.get("myMap"), undefined);
  });

  it("can rollback delete", () => {
    const memDB = new MemDB();

    // Create a map and insert a value
    memDB.create("KeyValue", "myMap");
    memDB.execute("myMap", "set", "myKey", "myValue");
    assert.strictEqual(memDB.execute("myMap", "get", "myKey"), "myValue");

    // Capture undo command
    const undo = memDB.undoCommand("delete", "myMap");

    // Delete the map
    memDB.delete("myMap");
    assert.rejects(() => {
      memDB.execute("myMap", "get", "myKey");
    }, new Error("Missing datastructure for myMap"));

    // Execute rollback
    undo.execute();

    // Verify rollback recovered the map's original values
    assert.strictEqual(memDB.execute("myMap", "get", "myKey"), "myValue");
  });

  it("can rollback execute", () => {
    const memDB = new MemDB();

    memDB.create("SortedSet", "mySortedSet");
    memDB.execute("mySortedSet", "set", "001", "A");
    memDB.execute("mySortedSet", "set", "002", "B");
    memDB.execute("mySortedSet", "set", "003", "C");

    const undo = memDB.undoCommand(
      "execute",
      "mySortedSet",
      "deleteByRange",
      "000",
      "100"
    );

    memDB.execute("mySortedSet", "deleteByRange", "000", "100");

    assert.deepStrictEqual(
      memDB.execute("mySortedSet", "getByRange", "000", "100"),
      []
    );

    undo.execute();

    assert.deepStrictEqual(
      memDB.execute("mySortedSet", "getByRange", "000", "100"),
      [
        ["001", "A"],
        ["002", "B"],
        ["003", "C"],
      ]
    );
  });
});
