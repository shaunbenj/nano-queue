import Queue from "../../../../app/services/mem_db/datastructures/queue.js";
import luaExecutor, {
  TransactionManager,
} from "../../../../app/services/mem_db/lua_executor.js";

describe("LuaExecutor", () => {
  it("executes", async () => {
    const queue = new Queue();
    const manager = new TransactionManager(queue);
    luaExecutor.registerGlobal("mem_db", manager);

    let script = `
    local clock = os.clock
    function sleep(n)  -- seconds
      local t0 = clock()
      while clock() - t0 <= n do
      end
    end

    sleep(1)

    return mem_db.execute("leftPeek")
    `;

    const p = luaExecutor.execute(script);

    queue.leftPush(1);

    const v = p;

    assert.strictEqual(queue.leftPeek(), 1);

    script = `
    g2 = x
    mem_db.execute("leftPush", x)
    -- mem_db.execute("leftBatchPush", 3) -- this will raise an error
    `;

    const x = await luaExecutor.getGlobal("g2");

    assert.throws(() => {
      luaExecutor.execute(script);
    }, new Error("Error: Rolled back from error Error: leftBatchPush expects an array, got 3"));

    // It rolls back to  the original state
    assert.strictEqual(queue.leftPeek(), 1);
  });
});
