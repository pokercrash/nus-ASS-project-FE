# Bookly Care Frontend (React + Vite)

Modern appointment booking frontend scaffold with integrated authentication against your existing auth service.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- shadcn-style UI primitives
- React Router

## Auth Integration

Implemented from `auth-api-integration.md`:

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
- `authorizedFetch` retries once after refresh on `401`

## Screens / Routes

Public:

- `/`
- `/login`
- `/register`

Authenticated product routes:

- `/app/dashboard`
- `/app/discover`
- `/app/calendar`
- `/app/appointments`
- `/app/reminders`
- `/app/account`

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
- Frontend: `http://localhost:5173`
