'use strict';

const { render, wrapWithTheme, THEMES } = require('../src/lib/markdown');

describe('render()', () => {
  test('convierte encabezados', () => {
    const { html } = render('# Hola\n## Mundo');
    expect(html).toContain('<h1>Hola</h1>');
    expect(html).toContain('<h2>Mundo</h2>');
  });

  test('convierte énfasis y código inline', () => {
    const { html } = render('**bold** y *italic* con `code`');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<code>code</code>');
  });

  test('convierte listas', () => {
    const { html } = render('- uno\n- dos\n- tres');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>uno</li>');
    expect(html).toContain('<li>tres</li>');
  });

  test('convierte enlaces', () => {
    const { html } = render('[Edward](https://github.com/Edward-Edo)');
    expect(html).toContain('href="https://github.com/Edward-Edo"');
    expect(html).toContain('>Edward</a>');
  });

  test('resalta bloques de código', () => {
    const md = '```js\nconst x = 1;\n```';
    const { html } = render(md);
    expect(html).toContain('<pre>');
    expect(html).toContain('<code');
    expect(html).toContain('hljs');
  });

  test('soporta tablas GFM', () => {
    const md = '| a | b |\n|---|---|\n| 1 | 2 |';
    const { html } = render(md);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>a</th>');
    expect(html).toContain('<td>1</td>');
  });

  test('sanitiza HTML peligroso', () => {
    const { html } = render('<script>alert("xss")</script>texto');
    expect(html).not.toContain('<script>');
    expect(html).toContain('texto');
  });

  test('sanitiza iframes', () => {
    const { html } = render('<iframe src="evil.com"></iframe>Hola');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('Hola');
  });

  test('lanza TypeError si no es string', () => {
    expect(() => render(123)).toThrow(TypeError);
    expect(() => render(null)).toThrow(TypeError);
  });

  test('respeta allowedTags adicionales', () => {
    const { html } = render('<custom>x</custom>', { allowedTags: ['custom'] });
    expect(html).toContain('<custom>');
  });
});

describe('wrapWithTheme()', () => {
  test('envuelve con CSS válido', () => {
    const result = wrapWithTheme('<h1>x</h1>', 'github');
    expect(result.html).toBe('<h1>x</h1>');
    expect(result.css).toContain('body');
    expect(result.css).toContain('h1');
  });

  test('rechaza temas no soportados', () => {
    expect(() => wrapWithTheme('<p>x</p>', 'windows-95')).toThrow(/Tema no soportado/);
  });

  test('incluye los 4 temas', () => {
    expect(THEMES).toEqual(expect.arrayContaining(['github', 'monokai', 'tokyo-night', 'nord']));
    THEMES.forEach((theme) => {
      expect(() => wrapWithTheme('<p>x</p>', theme)).not.toThrow();
    });
  });
});
