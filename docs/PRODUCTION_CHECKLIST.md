# Production checklist (Render + Vercel + Neon)

## Backend (Render)

1. Set `SPRING_PROFILES_ACTIVE=prod` (enables secure cookies).
2. Set `COOKIE_SECURE=true`.
3. Set `CORS_ALLOWED_ORIGINS` to your Vercel URL(s), comma-separated — no wildcards.
4. Use Neon **direct** `DATABASE_URL` (hostname without `-pooler`) so Flyway can migrate reliably.
5. Set a strong Base64 `JWT_SECRET` (≥ 256 bits).
6. Bind port via Render’s `PORT` (app already uses `server.port=${PORT:8080}`).
7. Paystack: set live `PAYSTACK_*` keys and `PAYSTACK_CALLBACK_URL` to your frontend subscription page.

## Frontend (Vercel)

1. Set `NEXT_PUBLIC_API_URL` to `https://<your-backend>.onrender.com/api`.
2. Root Directory: `frontend`.
3. Ensure the backend CORS list includes the exact Vercel origin (including `https://`).

## Cookies across domains

With `COOKIE_SECURE=true`, auth cookies use `SameSite=None` so the Vercel SPA can call the Render API with credentials.
Mobile apps should keep using Bearer tokens from the login response body.
