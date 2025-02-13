import LuaExecutor from "../../lib/lua_executor.js";

describe("LuaExecutor", () => {
  it("runs scripts", async () => {
    const executor = await new LuaExecutor().initialize();

    // Register a calculator object
    const Calculator = {
      add: (a, b) => {
        return a + b;
      },
    };

    executor.registerGlobal("Calculator", Calculator);

    const luaScript = `return Calculator:add(1, 2)`;

    const result = executor.execute(luaScript);

    assert.strictEqual(result, 3);
  });
});
