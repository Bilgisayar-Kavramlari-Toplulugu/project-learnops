# LearnOps Frontend Starter

This folder is a reusable Next.js starter with:

- App Router + TypeScript
- Tailwind v4 + shadcn/ui
- React Query for server state
- Zustand for UI-local state
- Axios service layer
- Proxy/rewrite ready API flow

## Quick Start

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Open: `http://localhost:3000`

## Starter Conventions

- Imports use `@/...` where `@` maps to `src/`.
- API requests:
  - client: `src/lib/api/client.ts`
  - services: `src/features/**/services/**`
  - hooks: `src/features/**/hooks/**`
- UI state: `src/store/**`
- Mock data: `src/features/**/mocks/**`
- Shared types: `src/types/index.ts`

## Switching Mock vs Real API

Set in `.env`:

- `NEXT_PUBLIC_USE_MOCK_DASHBOARD=true` -> uses mock fallback
- `NEXT_PUBLIC_USE_MOCK_DASHBOARD=false` -> real API calls

## Key Files

- `src/lib/config/env.ts` -> typed env access
- `src/lib/config/routes.ts` -> central route constants
- `src/providers/query-provider.tsx` -> React Query provider
- `src/proxy.ts` -> request proxy middleware convention (Next 16)
