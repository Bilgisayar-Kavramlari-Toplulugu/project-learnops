# LearnOps Frontend

Current frontend app is built with:

- Next.js App Router + TypeScript
- Tailwind v4 + shadcn/ui primitives
- React Query for server state
- Zustand for UI-local state
- Axios-based API client

## Quick Start

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Open: `http://localhost:3000`

## Current Routes

- `/login`
- `/landing`
- `/dashboard`
- `/courses`
- `/exams`
- `/profile` (placeholder page)
- `/settings` (placeholder page)

Notes:
- `src/app/(dashboard)/*` is route-grouped in Next.js, so URL does not include `(dashboard)`.
- `ui-kit` is component-only right now and **not exposed as a route**.

## API Entegrasyonu (Sprint 7 — FE-21)

Dashboard su an FE tarafinda placeholder/starter data ile calisir.

Sprint 7'de React Query ile `GET /dashboard/summary` endpoint'ine
baglanan dashboard veri akisi eklenecek.

Bagimlilik: `BE-22` (Dashboard Summary API endpoint).

## Conventions

- Imports use `@/...` where `@` maps to `src/`.
- API client lives in `src/lib/api-client.ts`.
- Route constants are in `src/lib/routes.ts`.
- UI-local state is in `src/store/**`.
- Shared types are in `src/types/**`.

## Environment

Defined in `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` (default `/api`)
- `BACKEND_INTERNAL_URL` (rewrite target for server/proxy usage)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/ buraya auth ile erişiliyor
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── exams/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── login/page.tsx
│   │   ├── landing/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── theme/
│   │   ├── ui/
│   │   └── ui-kit/           # component-only, no route
│   ├── hooks/
│   │   └──                    # (su an bos)
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── dashboard-starter.config.ts
│   │   ├── dashboard-ui.config.ts
│   │   ├── env.ts
│   │   ├── query-keys.ts
│   │   ├── routes.ts
│   │   └── utils.ts
│   ├── providers/
│   │   └── query-provider.tsx
│   ├── services/
│   │   └──                    # (su an bos)
│   ├── store/
│   │   └── ui.store.ts
│   ├── types/
│   │   └── index.ts
│   └── proxy.ts
├── public/
│   └── avatars/              # 10 system avatars (SVG)
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

## Key Files

- `src/lib/env.ts` -> typed env access
- `src/lib/routes.ts` -> central route constants
- `src/lib/api-client.ts` -> axios instance + normalized API errors
- `src/providers/query-provider.tsx` -> React Query provider
- `src/proxy.ts` -> request header/proxy middleware convention
