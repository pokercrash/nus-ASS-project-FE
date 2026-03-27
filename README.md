# Bookly Care Frontend (React + Vite)

Modern appointment booking frontend scaffold with integrated authentication against your existing auth service.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- shadcn-style UI primitives
- React Router

## Auth Integration

Implemented from `docs-local/auth-api-integration.md`:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/health`

Behavior:

- Requests use `credentials: "include"`
- Session bootstrap runs refresh on app load
- Access token is kept in memory
- Protected routes redirect to `/login` when unauthenticated
- `authorizedFetch` retries once when a `401` response includes `action: "refresh"`
- If refresh fails, auth state is cleared and protected routes route back to login

## Resource Service Contract Handling

Resource service requests use the same cookie-based auth model:

- `credentials: "include"` on all protected requests
- if response is `401` with `{ action: "refresh" }`, frontend calls auth refresh and retries once
- `403`, `404`, and `5xx` errors are mapped to user-friendly UI states (retry/permission/not-found messaging)

## Screens / Routes

Public:

- `/`
- `/login`
- `/register`
- `/admin/login`

Authenticated product routes:

- `/app/dashboard`
- `/app/discover`
- `/app/calendar`
- `/app/appointments`
- `/app/reminders`
- `/app/account`

Authenticated admin routes:

- `/admin/dashboard`
- `/admin/resources`

## Local Run

1. Copy env:

```bash
cp .env.example .env
```

2. Install packages:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

## Backend Requirements

Your auth service should be running and allow CORS with credentials for your frontend origin.

Default local values:

- Auth service: `http://localhost:8080`
- Resource service: `http://localhost:8081`
- Frontend: `http://localhost:5173`
