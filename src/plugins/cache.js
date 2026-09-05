'use strict';

const fp = require('fastify-plugin');
const crypto = require('node:crypto');
const { LRU } = require('../lib/lru');

/**
 * Plugin de caché para resultados de conversión Markdown → HTML.
 * Usa la combinación (markdown + opciones) como clave hash.
 */
async function cachePlugin(fastify, options) {
  const cache = new LRU(options.maxSize ?? 100);

  function makeKey(markdown, opts) {
    const hash = crypto.createHash('sha256').update(markdown).update('|').update(JSON.stringify(opts));
    return hash.digest('hex');
  }

  fastify.decorate('mdCache', {
    get(markdown, opts) {
      const key = makeKey(markdown, opts);
      const cached = cache.get(key);
      if (cached) return { hit: true, ...cached };
      return { hit: false };
    },
    set(markdown, opts, value) {
      const key = makeKey(markdown, opts);
      cache.set(key, value);
    },
    clear() {
      cache.clear();
    },
    stats() {
      return { size: cache.size, maxSize: cache.maxSize };
    },
  });
}

module.exports = fp(cachePlugin, { name: 'md-cache' });
