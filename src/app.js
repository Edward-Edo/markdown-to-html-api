'use strict';

const Fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const sensible = require('@fastify/sensible');

const convertRoutes = require('./routes/convert');
const cachePlugin = require('./plugins/cache');

async function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? { level: process.env.LOG_LEVEL ?? 'info' },
    trustProxy: true,
    bodyLimit: 2 * 1024 * 1024,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: true });
  await app.register(sensible);
  await app.register(cachePlugin, { maxSize: parseInt(process.env.CACHE_MAX ?? '200', 10) });
  await app.register(convertRoutes);

  return app;
}

module.exports = { buildApp };
