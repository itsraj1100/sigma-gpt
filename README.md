# ChatGPT Clone

A full-stack, ChatGPT-style AI chat application. React/TypeScript frontend, Node/Express/TypeScript backend, PostgreSQL via Prisma, JWT auth, and real streaming responses from any OpenAI-compatible LLM API.

This is a real, runnable application — not a static mockup. Every feature listed below is wired end-to-end: a genuine database, genuine authentication, and genuine (streamed) calls to an LLM API.

---

## 1. Features

- Email/password auth (register, login, logout, session check) with JWT stored in an httpOnly cookie and bcrypt-hashed passwords
- New chat, send message, streamed AI replies (Server-Sent Events)
- Stop generation mid-stream, with the partial reply preserved
- Continue previous conversations; full chat history persisted in Postgres
- Rename / delete conversations (with a confirmation dialog)
- Search conversations by title (debounced)
- Copy any AI response to the clipboard
- Regenerate the last AI response
- Edit a previous message and resend (deletes everything after it and re-runs the AI)
- Markdown rendering (headings, lists, tables, links, blockquotes, bold/italic, inline code)
- Code blocks with syntax highlighting, a language label, and a copy button
- Automatic conversation titling after the first message (AI-generated, non-blocking, with a text-based fallback)
- Light / dark / system theme, saved locally, no flash-of-wrong-theme on load
- Fully responsive: sidebar becomes a mobile drawer under `md` breakpoint
- Per-user data isolation: you can never load or modify another user's conversations
- Centralized error handling, rate limiting, input validation, and user-friendly error messages throughout

## 2. Tech stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, react-markdown + remark-gfm, react-syntax-highlighter, lucide-react, Axios

**Backend:** Node.js, Express, TypeScript, Prisma (PostgreSQL), JWT (httpOnly cookie), bcryptjs, Zod, Helmet, CORS, express-rate-limit

**AI:** A small provider abstraction (`AIProvider`) with an `OpenAIProvider` implementation that talks to any OpenAI-compatible Chat Completions API (OpenAI, Azure OpenAI, OpenRouter, a local Ollama/vLLM server, etc.) over plain `fetch` — no vendor SDK required.

## 3. Folder structure

```
chatgpt-clone/
├── frontend/               React + Vite app
│   └── src/
│       ├── api/            axios client + one module per resource + SSE streaming client
│       ├── components/     layout/, sidebar/, chat/, common/
│       ├── hooks/          useAutoScroll, useDebounce
│       ├── pages/          LoginPage, RegisterPage, ChatPage
│       ├── store/          Zustand stores (auth, conversation, theme, ui)
│       ├── types/          shared frontend types
│       └── utils/          date/grouping helpers
│
├── backend/                Express + TypeScript API
│   ├── prisma/             schema.prisma + seed.ts
│   ├── src/
│   │   ├── config/         env, Prisma client
│   │   ├── controllers/    thin HTTP handlers
│   │   ├── services/       business logic (incl. services/ai/ provider abstraction)
│   │   ├── repositories/   all Prisma queries
│   │   ├── middleware/     auth, error handling, rate limiting, validation
│   │   ├── validators/     Zod schemas
│   │   ├── routes/         Express routers
│   │   └── app.ts / server.ts
│   └── tests/               integration tests (Vitest + Supertest)
│
├── docker-compose.yml       Postgres (+ optional pgAdmin)
└── package.json             root convenience scripts
```

## 4. Requirements

- Node.js 18+ (native `fetch` and `ReadableStream` are used directly, no polyfills)
- npm 9+
- Docker (for the bundled Postgres) **or** your own PostgreSQL 14+ instance
- An API key for any OpenAI-compatible Chat Completions endpoint

## 5. Installation

```bash
git clone <this-repo>
cd chatgpt-clone
npm run install:all
```

This installs both `backend/` and `frontend/` dependencies (they're independent apps, each with its own `package.json` — there is no shared `node_modules`).

## 6. Environment variables

Copy the example files and fill them in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**

| Variable | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Frontend origin(s) allowed to call the API, comma-separated |
| `DATABASE_URL` | Postgres connection string used by Prisma |
| `JWT_SECRET` | Long random string used to sign session tokens |
| `JWT_EXPIRES_IN` | Session lifetime, e.g. `7d` |
| `COOKIE_NAME` | Name of the httpOnly auth cookie |
| `AI_API_KEY` | API key for your LLM provider |
| `AI_BASE_URL` | Base URL of an OpenAI-compatible API, e.g. `https://api.openai.com/v1` |
| `AI_MODEL` | Chat model used for replies, e.g. `gpt-4o-mini` |
| `AI_TITLE_MODEL` | Model used for auto-titling (can be the same, cheaper is fine) |
| `AI_MAX_HISTORY_MESSAGES` | Max number of past messages sent as context |
| `AI_MAX_CONTEXT_CHARS` | Approximate character budget for context trimming |
| `AI_SYSTEM_PROMPT` | System prompt sent with every request |
| `MAX_MESSAGE_LENGTH` | Max characters allowed per message |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:4000/api` |

Never commit `.env` files — they're already covered by `.gitignore`.

### Using a non-OpenAI provider

Because `AI_BASE_URL` and `AI_API_KEY` are just plain config, pointing this at Azure OpenAI, OpenRouter, or a local Ollama/vLLM server (started with an OpenAI-compatible endpoint) generally works without touching code. To add a genuinely different provider (a different request/response shape), implement the `AIProvider` interface in `backend/src/services/ai/` and switch to it in `backend/src/services/ai/aiService.ts` — nothing else in the app needs to change.

## 7. Database setup

Start Postgres with the bundled `docker-compose.yml`:

```bash
npm run db:up
```

This starts a `postgres:16-alpine` container with credentials matching the `.env.example` `DATABASE_URL` (`chatgpt_clone` / `chatgpt_clone` / db `chatgpt_clone` on port `5432`). If you already run your own Postgres, just point `DATABASE_URL` at it instead.

### Prisma migration

```bash
npm run db:migrate
```

This runs `prisma migrate dev` inside `backend/`, creating the `User`, `Conversation`, and `Message` tables.

### Optional: seed demo data

```bash
npm run db:seed
```

Creates a demo user (`demo@example.com` / `password123`) with one sample conversation, so there's something to look at immediately.

### Optional: pgAdmin

```bash
docker compose --profile tools up -d
```

Available at `http://localhost:5050` (`admin@example.com` / `admin`).

## 8. Running the app

From the repo root, with Postgres already running and both `.env` files filled in:

```bash
npm run dev
```

This runs the backend (`http://localhost:4000`) and frontend (`http://localhost:5173`) concurrently. Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Open `http://localhost:5173`, register an account (or log in with the seeded demo account), and start chatting.

## 9. API reference

All responses use a consistent envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "...", "details": [...] } }
```

**Auth**

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, sets the session cookie |
| POST | `/api/auth/login` | Log in, sets the session cookie |
| POST | `/api/auth/logout` | Clear the session cookie |
| GET | `/api/auth/me` | Current authenticated user |

**Conversations** *(all require auth)*

| Method | Path | Description |
|---|---|---|
| GET | `/api/conversations` | List the current user's conversations |
| GET | `/api/conversations/search?q=` | Search conversations by title |
| POST | `/api/conversations` | Create a conversation |
| GET | `/api/conversations/:id` | Get a single conversation |
| PATCH | `/api/conversations/:id` | Rename a conversation |
| DELETE | `/api/conversations/:id` | Delete a conversation (cascades to its messages) |
| GET | `/api/conversations/:id/messages` | List messages in a conversation |
| POST | `/api/conversations/:id/messages` | Create a message directly (low-level) |
| POST | `/api/conversations/:id/chat` | Stream an AI reply (SSE) — see below |

**`POST /api/conversations/:id/chat`**

Body (one of the three):

```json
{ "content": "Hello!" }
{ "regenerate": true }
{ "content": "edited text", "editMessageId": "..." }
```

Response is `text/event-stream`:

```
data: {"delta":"Hel"}

data: {"delta":"lo!"}

event: done
data: {"messageId":"..."}
```

An `event: error` frame is sent instead of `done` if the upstream AI call fails.

## 10. AI configuration details

- **Context management** (`backend/src/services/contextService.ts`): only the most recent `AI_MAX_HISTORY_MESSAGES` messages are sent, further trimmed to fit `AI_MAX_CONTEXT_CHARS` (a simple character-based approximation of a token budget — swap in a real tokenizer if you need exact counts), plus the system prompt.
- **Streaming**: implemented with a hand-rolled SSE parser on both ends (not the `EventSource` API), because the request needs to be a `POST` with a JSON body and support `AbortSignal` for the stop button — things `EventSource` can't do.
- **Stop generation**: the frontend aborts its `fetch`; the backend detects the client disconnect (`req.on("close")`), aborts its own in-flight call to the LLM, and still saves whatever text had been generated so far.
- **Auto-titling**: fired in the background (not awaited) after the first message in a new conversation, so it never blocks the chat response. If the AI call fails, a title is derived from the first message's text instead.

## 11. Testing

```bash
npm test
```

Runs the backend's Vitest + Supertest integration suite (`backend/tests/`), which exercises registration, login/logout, validation, and conversation CRUD + cross-user authorization. These tests hit a real database, so point `DATABASE_URL` at a disposable test database first (a second local Postgres database, or a throwaway container) — don't run them against data you care about.

## 12. Production build

```bash
npm run build
```

Backend compiles to `backend/dist` (`npm run start --prefix backend` to run it); frontend builds a static bundle to `frontend/dist` (serve it with any static host or a reverse proxy in front of the API). In production, set `NODE_ENV=production`, use a strong random `JWT_SECRET`, set `CORS_ORIGIN` to your real frontend origin, and serve everything over HTTPS (the auth cookie is marked `secure` automatically when `NODE_ENV=production`).

## 13. Troubleshooting

- **"Missing required environment variable"** on backend start — you haven't copied `.env.example` to `.env`, or a value is missing.
- **CORS errors in the browser console** — `CORS_ORIGIN` in `backend/.env` doesn't match the URL you're loading the frontend from.
- **401 on every request** — check that `frontend/.env`'s `VITE_API_BASE_URL` is correct and that your browser isn't blocking third-party cookies (during local dev, frontend and backend run on different ports, which counts as cross-site — the app relies on `credentials: 'include'` / `withCredentials: true`, already wired up).
- **AI replies fail immediately** — check `AI_API_KEY` and `AI_BASE_URL` in `backend/.env`, and check the backend terminal for the logged upstream error.
- **Prisma can't connect / migrate fails** — confirm Postgres is running (`docker compose ps`) and `DATABASE_URL` matches its credentials/port.
- **Nothing happens when Postgres data resets after a machine restart** — the compose volume is named `postgres_data`; `docker compose down -v` will wipe it, `docker compose down` alone will not.

## 14. What's intentionally simplified

This is a from-scratch reference implementation, not a hardened production deployment. A few things are simplified on purpose, called out here rather than hidden:

- Like/dislike on AI messages are UI-only feedback (not persisted to the database).
- Context trimming uses an approximate character budget rather than a real tokenizer.
- Auto-titling only runs once, on a conversation's first message (editing that first message won't regenerate the title).
