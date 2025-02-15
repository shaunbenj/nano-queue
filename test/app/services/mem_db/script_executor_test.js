import MemDB from "../../../../app/services/mem_db/mem_db.js";
import ScriptExecutor from "../../../../app/services/mem_db/script_executor.js";

describe("ScriptExecutor", () => {
  it("executes scripts", async () => {
    const database = new MemDB();
    const executor = new ScriptExecutor(database);

    // Can read and write from memDB
    const script = `
        memDB.create("KeyValue", "myMap")
        memDB.execute("myMap", "set", "myKey", "myValue")
        return memDB.execute("myMap", "get", "myKey")
        `;

    const result = await executor.execute(script);

    assert.strictEqual(result, "myValue");

    // Rolls back if the script encounters an error
    const failure_script = `
    memDB.execute("myMap", "set", "myKey", "myValue2")
    memDB.delete("myMap")
    error("Trigger rollback") -- should roll back all previous commands
    `;

    try {
      await executor.execute(failure_script);
    } catch (error) {}

    // Restores the database back to where it was
    assert.strictEqual(database.execute("myMap", "get", "myKey"), "myValue");
  });
});
