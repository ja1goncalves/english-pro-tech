# EnglishProTech Frontend (Next.js + Tailwind CSS)

This is the Next.js frontend for EnglishProTech. It consumes the EnglishProTech FastAPI backend and implements the provided screens (dashboard, auth, missions/role-play, play).

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Runtime: Node.js 20+ (tested with Node 24.x)

-------------------------------------------------------------------------------
Prerequisites
-------------------------------------------------------------------------------
- Node.js 20 or 24.x (LTS recommended)
- npm (or yarn/pnpm)
- Running backend API (default http://localhost:8000) compatible with:
  - POST /api/v1/auth/token
  - DELETE /api/v1/auth
  - GET /api/v1/user/me
  - POST /api/v1/user/register
  - GET/POST /api/v1/role-play
- Optional TTS integrations:
  - OpenAI API key if using OpenAI TTS
  - Google Cloud service account and Text-to-Speech API enabled if using Google TTS

-------------------------------------------------------------------------------
Installation
-------------------------------------------------------------------------------
```bash
npm install
```

-------------------------------------------------------------------------------
Environment configuration
-------------------------------------------------------------------------------
Create a .env.local file in the project root to configure the app. All variables are optional; defaults are shown.

```env
# Used by next.config.ts to proxy /api/* requests from the browser to the backend
# Helpful to avoid CORS in development
BACKEND_URL=http://localhost:8000

# Used by server-side fetches inside Next.js route handlers (see src/service/interceptor.ts)
# Prefer setting this in production builds/deploys
EPT_API_URL=http://localhost:8000

# Name of the HttpOnly auth cookie used by middleware and session route
EPT_COOKIE_NAME=ept.token

# Text-to-Speech provider selection for in-app audio playback of AI messages
# If it contains the word "openai", the OpenAI TTS route is used; otherwise Google TTS
TTS_AGENT_AI=openai

# Voice/language settings for TTS
OPEN_AI_VOICE=alloy           # echo, fable, onyx, nova, shimmer
TTS_LANGUAGE=en-US            # also used by browser SpeechRecognition

# OpenAI API key for /frontend-api/tts/openai
OPENAI_API_KEY=

# Google Cloud credentials for /frontend-api/tts/gemini
# Set to an absolute path to your service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

Notes
- BACKEND_URL affects only browser requests to /api/* via Next.js rewrite rules.
- EPT_API_URL is used by server-side route handlers to call the backend securely with cookies.
- In production, cookies are sent with the Secure flag automatically (NODE_ENV=production).

-------------------------------------------------------------------------------
Running in development
-------------------------------------------------------------------------------
```bash
# Optionally set different backend endpoints
export BACKEND_URL=http://127.0.0.1:8000
export EPT_API_URL=http://127.0.0.1:8000

npm run dev
```

Open http://localhost:3000. Unauthenticated users will be redirected to /login.

-------------------------------------------------------------------------------
Build & run in production
-------------------------------------------------------------------------------
```bash
# Ensure EPT_API_URL (and any TTS keys) are set in the environment used at runtime
npm run build
npm run start
```

-------------------------------------------------------------------------------
Architecture overview
-------------------------------------------------------------------------------
- Next.js App Router with server components and route handlers under src/app.
- Auth: Cookie-based JWT stored in an HttpOnly, SameSite=Lax cookie named by EPT_COOKIE_NAME (default ept.token).
- Route protection: middleware.ts protects all routes except:
  - /login, /sign-up
  - /_next/*, /static/*
  - /frontend-api/* (internal APIs handled by Next.js)
- Backend proxying: next.config.ts rewrites /api/* → BACKEND_URL to avoid CORS when the browser calls backend endpoints directly. Internal server routes use EPT_API_URL.
- Internal service layer: src/service/interceptor.ts builds authenticated requests to the backend using the cookie.

Directory highlights
- src/app/frontend-api/session/route.ts: login (POST), logout (DELETE). Sets/clears the JWT cookie.
- src/app/frontend-api/proxy/user/me/route.ts: proxies GET /api/v1/user/me
- src/app/frontend-api/proxy/user/register/route.ts: proxies POST /api/v1/user/register
- src/app/frontend-api/proxy/role-play/route.ts: proxies GET/POST /api/v1/role-play
- src/app/frontend-api/tts/openai/route.ts: streams MP3 from OpenAI TTS (model tts-1)
- src/app/frontend-api/tts/gemini/route.ts: streams MP3 from Google Cloud Text-to-Speech
- src/service/interceptor.ts: shared fetchAPI with auth header built from the cookie
- src/service/user.ts, src/service/role-plays.ts: typed helpers for backend endpoints

Pages
- / (Dashboard): Personal dashboard and recent activity.
- /login: Calls POST /frontend-api/session to log in.
- /sign-up: Calls POST /frontend-api/proxy/user/register to create an account.
- /role-play: Lists missions (roles) from the backend.
- /role-play/play/[roleId]/[level]/[playCode]: Play screen; submits answers via POST /frontend-api/proxy/role-play.

-------------------------------------------------------------------------------
Integrations
-------------------------------------------------------------------------------
FastAPI backend
- All backend calls ultimately hit /api/v1/* on the backend specified by EPT_API_URL (server) or BACKEND_URL (browser rewrite for /api/*).

OpenAI Text-to-Speech
- Route: POST /frontend-api/tts/openai
- Required env: OPENAI_API_KEY, optional OPEN_AI_VOICE
- Model: tts-1, response MP3 stream

Google Cloud Text-to-Speech (Gemini naming here refers to Google path)
- Route: POST /frontend-api/tts/gemini
- Required env: GOOGLE_APPLICATION_CREDENTIALS (absolute path to JSON key), optional TTS_LANGUAGE
- Ensure the Text-to-Speech API is enabled for your project and the service account has permissions.

Client-side speech input
- The Play screen uses the browser’s SpeechRecognition API when available.
- Language is controlled by TTS_LANGUAGE (default en-US).

-------------------------------------------------------------------------------
Scripts
-------------------------------------------------------------------------------
- npm run dev: Start development server
- npm run build: Build for production
- npm run start: Start production server
- npm run lint: Run ESLint

-------------------------------------------------------------------------------
Troubleshooting
-------------------------------------------------------------------------------
- 401 Unauthorized
  - The JWT cookie may be missing/expired. Log in again; middleware will redirect to /login when missing.
- Backend URL differences
  - If calling backend from the browser via /api/* ensure BACKEND_URL is correct. For internal server routes, ensure EPT_API_URL is set.
- CORS in development
  - Use the /api/* rewrite via BACKEND_URL or use the internal /frontend-api/* routes to avoid CORS.
- OpenAI TTS errors
  - Ensure OPENAI_API_KEY is set and the account has access to the TTS model.
- Google TTS errors
  - Ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account file and that the TTS API is enabled.
