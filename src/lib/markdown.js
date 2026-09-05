'use strict';

const { Marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');
const DOMPurify = require('isomorphic-dompurify');

const HIGHLIGHT_LANGS = [
  'javascript',
  'typescript',
  'python',
  'php',
  'sql',
  'bash',
  'json',
  'html',
  'css',
  'yaml',
  'go',
  'rust',
  'java',
  'markdown',
];

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
});

/**
 * Convierte Markdown a HTML sanitizado.
 *
 * @param {string} markdown - Texto en Markdown.
 * @param {object} [options]
 * @param {boolean} [options.highlight=true] - Resaltar bloques de código.
 * @param {string[]} [options.allowedTags] - Tags extra permitidas por DOMPurify.
 * @returns {{ html: string, cached: boolean }}
 */
function render(markdown, options = {}) {
  if (typeof markdown !== 'string') {
    throw new TypeError('markdown debe ser un string');
  }
  const { highlight = true, allowedTags = [] } = options;

  if (!highlight) {
    marked.setOptions({});
  }

  const dirty = marked.parse(markdown);
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_TAGS: allowedTags,
  });

  return { html: clean };
}

const THEMES = ['github', 'monokai', 'tokyo-night', 'nord'];

function wrapWithTheme(html, theme = 'github') {
  if (!THEMES.includes(theme)) {
    throw new Error(`Tema no soportado: ${theme}. Opciones: ${THEMES.join(', ')}`);
  }
  const css = getThemeCss(theme);
  return { html, css };
}

function getThemeCss(theme) {
  const themes = {
    github:
      'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;line-height:1.6;color:#24292e;max-width:780px;margin:2rem auto;padding:0 1rem;}' +
      'h1,h2,h3,h4,h5,h6{margin-top:1.5em;margin-bottom:.5em;font-weight:600;line-height:1.25;}' +
      'h1{font-size:2em;border-bottom:1px solid #eaecef;padding-bottom:.3em;}' +
      'h2{font-size:1.5em;border-bottom:1px solid #eaecef;padding-bottom:.3em;}' +
      'code{background:#f6f8fa;padding:.2em .4em;border-radius:6px;font-size:85%;}' +
      'pre{background:#f6f8fa;padding:16px;border-radius:6px;overflow:auto;}' +
      'pre code{background:transparent;padding:0;}' +
      'blockquote{border-left:4px solid #dfe2e5;color:#6a737d;padding:0 1em;margin:0;}' +
      'table{border-collapse:collapse;margin:1em 0;}' +
      'th,td{border:1px solid #dfe2e5;padding:6px 13px;}' +
      'tr:nth-child(2n){background-color:#f6f8fa;}',
    monokai:
      'body{background:#272822;color:#f8f8f2;font-family:Menlo,Monaco,Consolas,monospace;max-width:780px;margin:2rem auto;padding:0 1rem;}' +
      'h1,h2,h3{border-bottom:1px solid #3e3d32;padding-bottom:.3em;}' +
      'code{background:#3e3d32;color:#f8f8f2;padding:.2em .4em;border-radius:4px;}' +
      'pre{background:#1e1f1c;padding:16px;border-radius:6px;overflow:auto;}' +
      'blockquote{border-left:4px solid #75715e;color:#cfcfc2;padding:0 1em;}',
    'tokyo-night':
      'body{background:#1a1b26;color:#c0caf5;font-family:-apple-system,sans-serif;max-width:780px;margin:2rem auto;padding:0 1rem;}' +
      'h1,h2,h3{color:#7aa2f7;}' +
      'code{background:#24283b;color:#bb9af7;padding:.2em .4em;border-radius:6px;}' +
      'pre{background:#16161e;padding:16px;border-radius:8px;overflow:auto;border:1px solid #2f3549;}' +
      'blockquote{border-left:4px solid #3d59a1;color:#565f89;padding:0 1em;}' +
      'a{color:#7dcfff;}',
    nord:
      'body{background:#2e3440;color:#d8dee9;font-family:-apple-system,sans-serif;max-width:780px;margin:2rem auto;padding:0 1rem;}' +
      'h1,h2,h3{color:#88c0d0;}' +
      'code{background:#3b4252;color:#a3be8c;padding:.2em .4em;border-radius:6px;}' +
      'pre{background:#2e3440;padding:16px;border-radius:8px;border:1px solid #4c566a;}' +
      'blockquote{border-left:4px solid #5e81ac;color:#81a1c1;padding:0 1em;}' +
      'a{color:#88c0d0;}',
  };
  return themes[theme];
}

module.exports = { render, wrapWithTheme, THEMES };
