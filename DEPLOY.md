# OmniPDF — Deployment Guide

## What's Working Now

All 10 tools are fully functional:

| Tool | Endpoint | Status |
|------|----------|--------|
| Merge PDF | POST /api/merge-pdf | ✅ Working |
| Split PDF | POST /api/split-pdf | ✅ Working |
| Compress PDF | POST /api/compress-pdf | ✅ Working |
| PDF to Images | POST /api/pdf-to-images | ✅ Working (ZIP) |
| PDF to Text | POST /api/pdf-to-text | ✅ Working |
| PDF to Word | POST /api/pdf-to-word | ✅ Working |
| Images to PDF | POST /api/images-to-pdf | ✅ Working |
| PDF Editor | POST /api/pdf-editor/reorder, /delete, /rotate | ✅ Working |
| PDF Summarizer | POST /api/pdf-summarize + AI | ✅ Working |
| P2P Transfer | WebRTC (client-side) | ✅ Working |

## Quick Start (Local)

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Deploy with Docker

```bash
docker-compose up -d
```

Or manually:
```bash
docker build -t omipdf .
docker run -p 3000:3000 omipdf
```

## Deploy to Render / Railway / Fly.io

### Render
1. Connect your GitHub repo
2. Build command: `pnpm install && pnpm build`
3. Start command: `node dist/index.js`
4. Port: 3000

### Railway
```bash
railway init
railway up
```

### Fly.io
```bash
fly launch
fly deploy
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Default 3000 |
| NODE_ENV | No | production/development |
| BUILT_IN_FORGE_API_URL | Optional | S3 storage via Forge (for storing processed files) |
| BUILT_IN_FORGE_API_KEY | Optional | Forge API key |

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express + tRPC
- **PDF Processing**: pdf-lib (manipulation), pdf-parse (text extraction)
- **Image Processing**: sharp
- **File Format**: docx (Word generation)
- **Bundler**: esbuild (server) + Vite (client)
