# Backend — ChatGPT Clone API

Express + TypeScript REST API with JWT auth, PostgreSQL (via Prisma), and streamed AI replies over SSE.

See the [root README](../README.md) for full setup instructions, environment variables, the API reference, and testing/deployment notes. Quick start from this folder:

```bash
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, AI_API_KEY, etc.
npm install
npm run prisma:migrate
npm run seed               # optional demo user
npm run dev                 # http://localhost:4000
```

## Layout

```
src/
├── config/        env loading, Prisma client singleton
├── controllers/   thin HTTP handlers - no business logic
├── services/      business logic, incl. services/ai/ (provider abstraction)
├── repositories/  every Prisma query lives here
├── middleware/     auth, centralized error handling, rate limiting, validation
├── validators/    Zod request schemas
├── routes/        Express routers
├── types/         shared types + Express Request augmentation
└── utils/         ApiError, ApiResponse, asyncHandler, small helpers
```

Route → Controller → Service → Repository/Provider is the intended call direction throughout; controllers never touch Prisma directly.
