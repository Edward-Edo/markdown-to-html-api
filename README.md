# ✍️ markdown-to-html-api

[![CI](https://github.com/Edward-Edo/markdown-to-html-api/actions/workflows/ci.yml/badge.svg)](https://github.com/Edward-Edo/markdown-to-html-api/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Made with Fastify](https://img.shields.io/badge/fastify-4.x-black)](https://fastify.dev/)

API REST **rápida, segura y lista para producción** que convierte Markdown a HTML sanitizado, con resaltado de sintaxis, temas CSS opcionales y caché LRU en memoria. Construida sobre [Fastify](https://fastify.dev/) + [marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify).

Ideal para blogs, generadores estáticos, sistemas de documentación, previews en editores WYSIWYG y pipelines de publicación.

---

## ✨ Características

- 🚀 **Alto rendimiento** — servidor Fastify con logging estructurado y validación de schemas.
- 🛡️ **HTML seguro** — sanitización con DOMPurify contra XSS (`<script>`, `<iframe>`, etc.).
- 🎨 **4 temas CSS** listos para usar: `github`, `monokai`, `tokyo-night`, `nord`.
- 🧠 **Caché LRU** con clave SHA-256 sobre (markdown + opciones) y header `X-Cache: HIT/MISS`.
- 🌈 **Resaltado de sintaxis** con `highlight.js` (JS, TS, Python, PHP, SQL, Bash, JSON, HTML, CSS, YAML, Go, Rust, Java, Markdown).
- 🔌 **CORS + Helmet** activados por defecto.
- ✅ **Tests completos** con Jest (cobertura de markdown, caché y endpoints).

---

## 📦 Instalación

```bash
git clone https://github.com/Edward-Edo/markdown-to-html-api.git
cd markdown-to-html-api
npm install
```

Requisitos: **Node.js >= 18**.

---

## 🚀 Uso

### Iniciar el servidor

```bash
npm start
# servidor en http://localhost:3000

# modo desarrollo (recarga automática con --watch)
npm run dev
```

Variables de entorno:

| Variable        | Default | Descripción                        |
|-----------------|---------|------------------------------------|
| `PORT`          | `3000`  | Puerto HTTP                        |
| `HOST`          | `0.0.0.0` | Host de escucha                  |
| `LOG_LEVEL`     | `info`  | Nivel de log (`debug`, `info`, `warn`, `error`) |
| `CACHE_MAX`     | `200`   | Tamaño máximo de la caché LRU      |

---

## 📡 Endpoints

### `GET /health`

Estado del servicio y tamaño actual de la caché.

```json
{ "status": "ok", "cache": { "size": 3, "maxSize": 200 } }
```

### `POST /convert`

Convierte Markdown a HTML sanitizado.

**Body:**
```json
{
  "markdown": "# Hola\n\n**mundo**",
  "highlight": true,
  "theme": "github",
  "withStyles": false,
  "allowedTags": []
}
```

**Respuesta:**
```json
{
  "html": "<h1>Hola</h1>\n<p><strong>mundo</strong></p>\n"
}
```

Si `withStyles=true`, devuelve también `css` con los estilos del tema elegido.

### `POST /cache/clear`

Vacía la caché LRU.

```json
{ "cleared": true }
```

---

## 🔧 Ejemplos con `curl`

```bash
# Conversión básica
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hola"}'

# Con tema y CSS incluido
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown":"```js\nconst x = 1;\n```","theme":"tokyo-night","withStyles":true}'

# Limpiar caché
curl -X POST http://localhost:3000/cache/clear

# Health check
curl http://localhost:3000/health
```

### Ejemplo JavaScript (cliente)

```js
const res = await fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markdown: '# Hola' }),
});
const { html } = await res.json();
console.log(html);
```

---

## 🧪 Tests

```bash
npm test
npm run lint
```

Suite incluye:

- Renderizado de Markdown (encabezados, listas, enlaces, tablas GFM, código).
- Sanitización de XSS (`<script>`, `<iframe>`).
- Caché LRU (evicción, reordenamiento, clear).
- Endpoints REST (validación, cache HIT/MISS, theming).

---

## 🗂️ Estructura del proyecto

```
markdown-to-html-api/
├── src/
│   ├── server.js              # Bootstrap + signal handlers
│   ├── app.js                 # Fastify instance + plugins
│   ├── lib/
│   │   ├── markdown.js        # Render + temas
│   │   └── lru.js             # Caché LRU
│   ├── plugins/
│   │   └── cache.js           # Plugin Fastify de caché
│   └── routes/
│       └── convert.js         # /health, /convert, /cache/clear
├── tests/
│   ├── markdown.test.js
│   ├── lru.test.js
│   └── api.test.js
├── .github/workflows/ci.yml
├── package.json
├── jest.config.cjs
├── .eslintrc.cjs
├── .prettierrc.json
├── LICENSE
├── .gitignore
└── README.md
```

---

## ⚙️ Configuración avanzada

### Docker (ejemplo)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/server.js"]
```

---

## 🤝 Contribuir

1. Fork & branch: `git checkout -b feat/mi-mejora`
2. `npm install`
3. `npm run lint && npm test` deben pasar.
4. Abre un Pull Request.

---

## 📄 Licencia

[MIT](LICENSE) © 2026 Edward Itriago

---

## ✍️ Autor

**Edward Itriago** — Full Stack Developer
📧 edwarditriagosub@gmail.com · 🔗 [github.com/Edward-Edo](https://github.com/Edward-Edo)
