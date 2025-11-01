# EnglishProTech Frontend (Next.js + Tailwind CSS)

This is a frontend that consumes the EnglishProTech FastAPI backend and follows the provided view designs.

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Node: 24.x

## Prerequisites
- Node.js 24.x (LTS)
- npm, yarn, or pnpm
- Running backend API (default: http://localhost:8000)

## Getting Started

1. Install dependencies
```bash
cd frontend
npm install
```

2. Run the development server
```bash
# optionally set the backend URL (defaults to http://localhost:8000)
export BACKEND_URL=http://localhost:8000
npm run dev
```

3. Open the app
- http://localhost:3000
- Unauthenticated users are redirected to /login

## Pages
- / (Dashboard): Shows welcome and quick actions (per views/home/_dashboard).
- /login: Cookie-based auth. POSTs credentials to internal `/frontend-api/session` which proxies `/api/v1/auth/token` and sets an HttpOnly cookie.
- /sign-up: Registration per views/sign-up. Calls backend `/api/v1/user/register`.
- /role-play (Missions): Lists missions from backend `/api/v1/role-play/` with design inspired by views/missions; links to the play screen.
- /role-play/play/[roleId]/[level]/[playCode]: Play screen. Submits answers to POST `/api/v1/role-play/` and shows history (play_story) per views/role-play.

## Auth, Security and API Access
- JWT is stored in an HttpOnly, SameSite=Lax cookie (Secure in production) named `auth_token`.
- Route protection is enforced via `middleware.ts` (all routes except /login, /sign-up, static, and /frontend-api).
- Internal API routes:
  - POST/DELETE `/frontend-api/session`: login/logout (sets/clears cookie; logout also calls backend DELETE /api/v1/auth when possible).
  - GET/POST `/frontend-api/proxy/role-play`: forwards to backend `/api/v1/role-play/` with Authorization from cookie.
  - GET `/frontend-api/proxy/user/me`: forwards to `/api/v1/user/me`.

## How it avoids CORS during development
`next.config.mjs` defines a rewrite that proxies `/api/*` to the backend (default `http://localhost:8000`). This is used for endpoints we call directly from the browser (e.g., registration). Internal routes under `/frontend-api/*` are handled by Next.js.

To change the backend URL, set env var when running dev/build:
```bash
BACKEND_URL=http://127.0.0.1:8000 npm run dev
```

## Tailwind CSS
- Configured via `tailwind.config.ts` and `postcss.config.js`
- Styles imported from `app/globals.css`

## Build & Run (production)
```bash
# build
npm run build
# start production server
npm run start
```
