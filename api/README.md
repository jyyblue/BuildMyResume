# BuildMyResume API

Backend API for [BuildMyResume](https://github.com/rashidrashiii/BuildMyResume) — a free, open-source resume builder.

Built with **NestJS** for a clean modular architecture. Deployable on **Vercel**, Railway, or any Node.js host.

## 🏗️ Architecture

```
src/
├── ai/                    # AI Module — Puter.js AI proxy
│   ├── ai.controller.ts   # POST /ai/chat, /ai/enhance, /ai/generate
│   ├── ai.service.ts      # Puter API communication
│   ├── dto/               # Request validation
│   └── prompts/           # System prompts for each AI mode
├── export/                # Export Module — PDF generation
│   ├── export.controller.ts  # POST /export/pdf
│   └── export.service.ts     # Puppeteer PDF rendering
├── health/                # Health Module
│   └── health.controller.ts  # GET /health
├── app.module.ts          # Root module
└── main.ts                # Bootstrap (CORS, validation, port)
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

The API runs on `http://localhost:4000` by default.

## 📡 API Endpoints

### AI Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Main AI chat — supports `CHAT`, `GENERATE`, `ENHANCE` modes |
| POST | `/ai/enhance` | Enhance resume content (field-level) |
| POST | `/ai/generate` | Generate full resume from a brief |

### Export Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/export/pdf` | Generate PDF from HTML content |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## 🔧 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Server port |
| `FRONTEND_URL` | No | — | Production frontend URL for CORS |

> **Note:** This API uses [Puter.js](https://puter.com) for AI. Authentication tokens are passed per-request from the frontend — no API keys needed on the backend!

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

The `vercel.json` config is pre-configured for serverless deployment.

## 📝 License

MIT — see [LICENSE](./LICENSE).
