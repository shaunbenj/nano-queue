// In memory database of key value pairs.
class MemoryDatabase {
  constructor() {
    this.memory = {};
  }

  set(key, val) {
    this.memory[key] = val;
    return true;
  }

  get(key) {
    return this.memory[key];
  }

  incr(key, by = 1) {
    const val = this.memory[key];
    let num = Number(val);
    if (isNaN(num)) {
      throw new Error(`MemoryDatabase: Failed to convert ${val} to number`);
    }
    this.memory[key] = num + by;
  }
}

module.exports = MemoryDatabase;
