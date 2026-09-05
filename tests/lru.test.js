'use strict';

const { LRU } = require('../src/lib/lru');

describe('LRU', () => {
  test('almacena y recupera', () => {
    const lru = new LRU(3);
    lru.set('a', 1);
    expect(lru.get('a')).toBe(1);
    expect(lru.has('a')).toBe(true);
  });

  test('elimina el elemento más antiguo al exceder maxSize', () => {
    const lru = new LRU(2);
    lru.set('a', 1);
    lru.set('b', 2);
    lru.set('c', 3);
    expect(lru.has('a')).toBe(false);
    expect(lru.has('b')).toBe(true);
    expect(lru.has('c')).toBe(true);
    expect(lru.size).toBe(2);
  });

  test('reordena por acceso', () => {
    const lru = new LRU(2);
    lru.set('a', 1);
    lru.set('b', 2);
    lru.get('a');
    lru.set('c', 3);
    expect(lru.has('a')).toBe(true);
    expect(lru.has('b')).toBe(false);
  });

  test('clear() vacía la caché', () => {
    const lru = new LRU(3);
    lru.set('x', 1);
    lru.clear();
    expect(lru.size).toBe(0);
  });

  test('rechaza maxSize inválido', () => {
    expect(() => new LRU(0)).toThrow();
    expect(() => new LRU(-1)).toThrow();
    expect(() => new LRU(1.5)).toThrow();
  });
});
