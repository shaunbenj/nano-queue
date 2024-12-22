// In memory database of key value pairs
export default class MemoryDatabase {
  constructor() {
    this.memory = new Map();
  }

  set(key, val) {
    this.memory.set(key, val);
    return true;
  }

  get(key) {
    return this.memory.get(key);
  }

  incr(key, by = 1) {
    const val = this.get(key);
    let num = Number(val);
    if (isNaN(num)) {
      throw new Error(`MemoryDatabase: Failed to convert ${val} to number`);
    }
    this.set(key, num + by);
  }
}
