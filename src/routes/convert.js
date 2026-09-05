'use strict';

const { render, wrapWithTheme, THEMES } = require('../lib/markdown');

const convertSchema = {
  body: {
    type: 'object',
    required: ['markdown'],
    properties: {
      markdown: { type: 'string', minLength: 1, maxLength: 1_000_000 },
      highlight: { type: 'boolean', default: true },
      theme: { type: 'string', enum: THEMES, default: 'github' },
      withStyles: { type: 'boolean', default: false },
      allowedTags: { type: 'array', items: { type: 'string' }, default: [] },
    },
  },
};

async function convertHandler(request, reply) {
  const { markdown, highlight, theme, withStyles, allowedTags } = request.body;

  const cacheKey = { markdown, highlight, withStyles, allowedTags };
  const cached = request.server.mdCache.get(markdown, cacheKey);
  if (cached.hit) {
    reply.header('X-Cache', 'HIT');
    return applyTheme(cached, theme, withStyles, reply);
  }

  try {
    const { html } = render(markdown, { highlight, allowedTags });
    request.server.mdCache.set(markdown, cacheKey, { html });
    reply.header('X-Cache', 'MISS');
    return applyTheme({ html }, theme, withStyles, reply);
  } catch (err) {
    request.log.error({ err }, 'Error en conversión');
    return reply.code(400).send({ error: 'BAD_MARKDOWN', message: err.message });
  }
}

function applyTheme(payload, theme, withStyles, reply) {
  if (!withStyles) return payload;
  const wrapped = wrapWithTheme(payload.html, theme);
  return { ...payload, ...wrapped };
}

async function routes(fastify) {
  fastify.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              cache: {
                type: 'object',
                properties: { size: { type: 'integer' }, maxSize: { type: 'integer' } },
              },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      cache: fastify.mdCache.stats(),
    }),
  );

  fastify.post(
    '/convert',
    { schema: convertSchema },
    convertHandler,
  );

  fastify.post(
    '/cache/clear',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { cleared: { type: 'boolean' } },
          },
        },
      },
    },
    async () => {
      fastify.mdCache.clear();
      return { cleared: true };
    },
  );
}

module.exports = routes;
