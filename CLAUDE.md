# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the server
npm start          # node index.js, listens on PORT (default 3000)

# Install dependencies
npm install
```

No test runner is configured (`npm test` exits with error). No linter is configured.

## Environment Setup

Copy `sample.env` to `.env` and fill in real values. Required variables:

| Variable | Purpose |
|---|---|
| `SUPABASE_PROJECT_URL` | Supabase project REST URL |
| `SUPA_BASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `JWT_SECRET` | Signs/verifies access tokens |
| `FAST2SMS_API_KEY` | Fast2SMS bulk SMS API key |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay payment gateway |
| `RESEND_API_KEY` | Resend transactional email |
| `PORT` | HTTP listen port (default 3000) |

Firebase credentials are loaded from `firebase-service-account.json` (committed to repo).

Each third-party service file (`src/services/*.js`) can be run directly (`node src/services/firebase.js`) to smoke-test that client's connection.

## Architecture

### Entry point & routing

`index.js` boots the Express app and mounts all routers under `/api/v1/`. Route files in `src/routes/` are thin pass-throughs — they `require` a service-specific router and re-export it (or are empty stubs awaiting implementation). The real logic lives in `src/services/<domain>/`.

```
index.js
└── /api/v1/auth        → src/routes/auth.js → src/services/auth/routes.js
└── /api/v1/profile     → src/services/profile/routes.js
└── /api/v1/users       → src/routes/users.js          (stub)
└── /api/v1/bookings    → src/routes/bookings.js        (stub)
└── /api/v1/jobs        → src/routes/jobs.js            (stub)
└── /api/v1/admin       → src/routes/admin.js           (stub)
└── /api/v1/notifications → src/routes/notifications.js (stub)
```

### Three-layer service pattern

Each implemented domain follows: **routes → controller → service**

- **routes.js** — defines HTTP verbs/paths, applies middleware (e.g. `auth`)
- **controller.js** — extracts req fields, calls service, sends response
- **service.js** — all business logic and direct Supabase queries

### Authentication flow

1. `POST /auth/send-otp` — generates a 6-digit OTP, inserts into `otp_verification`, sends via Fast2SMS
2. `POST /auth/verify-otp` — validates OTP, auto-creates a `users` row on first login (role: `customer`), returns a JWT access token (24h) and a random hex refresh token (30 days) stored in `refresh_tokens`
3. `POST /auth/refresh-token` — exchanges a valid refresh token for a new JWT
4. `POST /auth/logout` — sets `is_revoked = true` on the refresh token

Protected routes use `src/middleware/auth.js` which verifies the `Authorization: Bearer <jwt>` header and attaches `req.user = { id, phone, role }`.

### Supabase tables (inferred from service code)

| Table | Key columns |
|---|---|
| `otp_verification` | `phone_number`, `otp`, `expires_at`, `is_used` |
| `users` | `phone_number`, `role`, `last_login_at` |
| `refresh_tokens` | `user_id`, `token`, `expires_at`, `is_revoked` |
| `customer_profiles` | `user_id`, `name`, `email`, `profile_photo_url` |

### Error convention

Services throw errors as `Object.assign(new Error(message), { status: httpCode })`. Controllers catch with `res.status(err.status || 500)`. This pattern must be followed in all new service code.

### External service clients

All clients are singletons initialized at module load from `process.env`:
- `src/services/supabase.js` — Supabase JS client (service-role key, bypasses RLS)
- `src/services/firebase.js` — Firebase Admin SDK (from `firebase-service-account.json`)
- `src/services/razorpay.js` — Razorpay client
- `src/services/resend.js` — Resend email client
- `src/services/fast2sms.js` — Axios wrapper around Fast2SMS bulk API
