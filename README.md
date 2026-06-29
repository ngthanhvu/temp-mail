# Temp Mail

Disposable temporary email service powered by Cloudflare Email Workers + Node.js + Nuxt 3.

## Architecture

```
Sender → Cloudflare DNS/MX → Email Worker (postal-mime)
                                    ↓ POST webhook
                              Backend (Fastify + SQLite)
                                    ↓ REST API + SSE
                              Nuxt 3 Frontend (Vue + Tailwind)
```

## Quick Start

### Option A: Docker Compose (recommended)

```bash
# 1. Copy and configure env
cp .env.example .env
# Edit .env — change WEBHOOK_SECRET to a strong random string

# 2. Build and run
docker compose up -d --build

# 3. Access:
#    Frontend: http://localhost:3000
#    Backend:  http://localhost:4000
```

Database persists in a Docker volume (`db-data`). Logs: `docker compose logs -f`

### Option B: Manual (dev)

**Backend:**
```bash
cd backend && npm install && npm run dev
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

### Cloudflare Worker

```bash
cd worker && npm install
# Edit wrangler.toml with your WEBHOOK_URL and WEBHOOK_SECRET
npm run deploy
```

After deploying, configure Email Routing in Cloudflare dashboard:
1. Go to **Email → Email Routing → Routes**
2. Create a catch-all route pointing to your deployed worker
3. Ensure MX records are set for your domains

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `WEBHOOK_SECRET` | Docker / Backend + Worker | Shared secret for webhook authentication |
| `FRONTEND_URL` | Docker / Backend | Frontend origin for CORS |
| `NUXT_PUBLIC_API_BASE` | Docker / Frontend | Backend API URL |
| `PORT` | Backend only | Server port (default: 4000) |

## Project Structure

```
├── backend/          # Node.js API server (Fastify + SQLite)
├── frontend/         # Nuxt 3 + Vue + TailwindCSS
├── worker/           # Cloudflare Email Worker
├── docker-compose.yml
├── .env.example
└── README.md
```

## Features

- **Instant temp email** — auto-generated on visit, no registration
- **Multiple domains** — pick from your Cloudflare domains
- **Real-time inbox** — SSE push notifications for new emails
- **HTML email rendering** — sandboxed iframe for safe display
- **Attachments** — download inline attachments
- **Auto-cleanup** — emails expire after 1 hour
- **Rate limiting** — 100 req/min on API endpoints

## Deployment

### Docker (Your Server)
```bash
# Copy env, then:
docker compose up -d --build
```

### Frontend (Vercel / Cloudflare Pages)
```bash
cd frontend && npm run build
# Deploy .output/ directory
```

### Backend (pm2 / systemd)
```bash
cd backend && npm run build
pm2 start dist/index.js --name temp-mail
```

### Worker (Cloudflare)
```bash
cd worker && npm run deploy
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/webhook/email | Receive email from Cloudflare Worker |
| GET | /api/inboxes | List active inboxes |
| POST | /api/inboxes | Create new inbox |
| GET | /api/domains | List available domains |
| GET | /api/inboxes/:addr/emails | List emails for inbox |
| GET | /api/emails/:id | Get full email detail |
| GET | /api/inboxes/:addr/sse | SSE stream for real-time updates |
