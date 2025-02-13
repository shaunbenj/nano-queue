import { LuaFactory } from "wasmoon";

export default class LuaExecutor {
  constructor() {
    this.lua = null;
    this.factory = null;
  }

  async initialize() {
    if (this.lua !== null) {
      return this;
    }

    this.factory = new LuaFactory();
    // Create standalone environment
    this.lua = await this.factory.createEngine();

    return this;
  }

  // Register globals in the Lua environment
  registerGlobal(name, global) {
    this.lua.global.set(name, global);
  }

  execute(script) {
    if (this.lua == null) {
      throw new Error("LuaEngine is not initialized. Call init() first.");
    }

    return this.lua.doStringSync(script);
  }

  async getGlobal(name) {
    return await this.lua.global.get(name);
  }
}
