'use strict';

/**
 * Caché LRU simple en memoria para resultados de render.
 * @template K, V
 */
class LRU {
  constructor(maxSize = 100) {
    if (!Number.isInteger(maxSize) || maxSize <= 0) {
      throw new RangeError('maxSize debe ser entero positivo');
    }
    this.maxSize = maxSize;
    /** @type {Map<K, V>} */
    this.store = new Map();
  }

  get(key) {
    if (!this.store.has(key)) return undefined;
    const value = this.store.get(key);
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, value);
    return value;
  }

  has(key) {
    return this.store.has(key);
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

module.exports = { LRU };
