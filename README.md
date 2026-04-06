# Finance Data Processing and Access Control Backend

REST API for a finance dashboard: **users and roles**, **financial records** (with soft delete), **aggregated dashboard data**, and **JWT-based RBAC**.

## Tech stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **JWT** (`jsonwebtoken`) + **bcryptjs** for passwords
- **Zod** for request validation
- **CORS** enabled for local frontend development

## Assumptions

1. **Shared ledger**: Financial records are visible to every **analyst** and **admin** (not per-user isolation). `createdBy` is stored for audit.
2. **No public registration**: Only an **admin** can create users via `POST /api/users`. Bootstrap an admin with `npm run seed`.
3. **Roles** (see `src/constants/roles.js`):
   - **viewer** — dashboard summaries and recent activity only (no raw record list).
   - **analyst** — read records + dashboard.
   - **admin** — full record CRUD (including soft delete), user management.
4. **MongoDB** version **5+** recommended (`$dateTrunc` used for trend buckets).

## Setup

1. Copy environment file and edit secrets:

   ```bash
   cp .env.example .env
   ```

   Set `MONGODB_URI` and a strong `JWT_SECRET`.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB locally (or point `MONGODB_URI` to Atlas).

4. Seed the first admin (optional but typical for first run):

   ```bash
   npm run seed
   ```

   Defaults: `admin@example.com` / `ChangeMe123!` (override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` in `.env`).

5. Run the API:

   ```bash
   npm run dev
   ```

   Server defaults to `http://localhost:3000`. Health check: `GET /health`.

## Authentication

1. `POST /api/auth/login` with `{ "email", "password" }`.
2. Use the returned token: `Authorization: Bearer <token>` on protected routes.

Current user: `GET /api/me`.

## API overview

| Method | Path | Who | Description |
|--------|------|-----|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/me` | Authenticated | Current user profile |
| GET | `/api/users` | Admin | List users |
| POST | `/api/users` | Admin | Create user (email, password, name, role, isActive) |
| GET | `/api/users/:id` | Admin | Get user |
| PATCH | `/api/users/:id` | Admin | Update name, role, isActive, password |
| DELETE | `/api/users/:id` | Admin | Delete user (not self) |
| GET | `/api/records` | Analyst, Admin | List/filter/paginate records |
| GET | `/api/records/:id` | Analyst, Admin | Get one record |
| POST | `/api/records` | Admin | Create record |
| PATCH | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft delete (`deletedAt`) |
| GET | `/api/dashboard/summary` | Viewer+ | Totals, net, category breakdown; optional `from`, `to` |
| GET | `/api/dashboard/recent` | Viewer+ | Recent non-deleted records; `limit` (default 10) |
| GET | `/api/dashboard/trends` | Viewer+ | Time buckets; `granularity=week\|month`, optional `from`, `to` |

### Record query parameters (`GET /api/records`)

- `type` — `income` | `expense`
- `category` — exact match (case-insensitive)
- `from`, `to` — date range on `date`
- `search` — substring match on `category` or `notes`
- `page`, `limit` — pagination (default page 1, limit 20, max 100)
- `includeDeleted=true` — **admin only**; includes soft-deleted rows

## Error handling

- **422** — Zod validation errors (`details.fieldErrors` / `formErrors`).
- **401** — Missing/invalid JWT or bad login.
- **403** — Inactive user or insufficient role.
- **404** — Unknown resource or soft-deleted record for non-admin.
- **409** — Duplicate email on user create.

## Project layout

```
server.js                 # Entry: Express app, DB connect, routes
scripts/seedAdmin.js      # First admin user
src/
  config/database.js      # Mongoose connection
  constants/roles.js      # Roles + capability grouping (documentation)
  controllers/            # HTTP handlers
  middleware/             # JWT auth, RBAC, Zod validate, error handler
  models/                 # User, FinancialRecord
  routes/                 # Route modules mounted under /api
  services/dashboardService.js  # Aggregation logic for summaries/trends
  validations/            # Zod schemas
  utils/AppError.js       # Operational errors with status codes
```

## Tradeoffs

- **JWT stateless**: No server-side revoke list; deactivate users via `isActive` (checked on each request).
- **Soft delete**: Deleted records stay in DB for audit; excluded from dashboard and default listing unless `includeDeleted` (admin).
