'use strict';

const { buildApp } = require('../src/app');

async function makeApp() {
  const app = await buildApp({ logger: false });
  await app.ready();
  return app;
}

describe('API REST', () => {
  let app;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  test('GET /health responde ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.cache).toHaveProperty('size');
  });

  test('POST /convert convierte Markdown', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/convert',
      payload: { markdown: '# Título' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().html).toContain('<h1>Título</h1>');
    expect(res.headers['x-cache']).toBe('MISS');
  });

  test('POST /convert usa caché en segunda llamada idéntica', async () => {
    const payload = { markdown: 'cached ' + Date.now() };
    const r1 = await app.inject({ method: 'POST', url: '/convert', payload });
    const r2 = await app.inject({ method: 'POST', url: '/convert', payload });
    expect(r1.headers['x-cache']).toBe('MISS');
    expect(r2.headers['x-cache']).toBe('HIT');
  });

  test('POST /convert valida payload', async () => {
    const res = await app.inject({ method: 'POST', url: '/convert', payload: {} });
    expect(res.statusCode).toBe(400);
  });

  test('POST /convert sanitiza XSS', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/convert',
      payload: { markdown: '<script>alert(1)</script>Hola' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().html).not.toContain('<script>');
  });

  test('POST /convert con theme devuelve CSS', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/convert',
      payload: { markdown: '# t', theme: 'tokyo-night', withStyles: true },
    });
    const body = res.json();
    expect(body.css).toContain('background');
    expect(body.html).toContain('<h1>t</h1>');
  });

  test('POST /convert con tema inválido falla', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/convert',
      payload: { markdown: 'x', theme: 'windows-95' },
    });
    expect(res.statusCode).toBe(400);
  });

  test('POST /cache/clear limpia la caché', async () => {
    const payload = { markdown: 'clear ' + Date.now() };
    await app.inject({ method: 'POST', url: '/convert', payload });
    const res = await app.inject({ method: 'POST', url: '/cache/clear' });
    expect(res.statusCode).toBe(200);
    expect(res.json().cleared).toBe(true);
  });
});
