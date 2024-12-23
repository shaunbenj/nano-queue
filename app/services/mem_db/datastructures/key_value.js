export default class KeyValue {
  constructor(map = new Map()) {
    this.map = map;
  }

  set(key, value) {
    this.map.set(key, value);

    return true;
  }

  get(key) {
    return this.map.get(key) || null;
  }

  incr(key, by = 1) {
    const value = this.get(key);
    let num = Number(value);

    if (isNaN(num)) {
      throw new Error(`KeyValue: Failed to convert ${value} to number`);
    }

    return this.set(key, num + by);
  }
}
