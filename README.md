<p align="center">
  <b>🇺🇸 English</b> |
  <a href="./README.pt-BR.md">🇧🇷 Português</a> |
  <a href="./README.es.md">🇪🇸 Español</a>
</p>

# 📊 Smart Option — Admin Panel

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-9.x-007FFF?style=for-the-badge&logo=mui&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <a href="#about">About</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#features">Features</a> •
  <a href="#stack">Stack</a> •
  <a href="#structure">Structure</a> •
  <a href="#routes">Routes</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-configuration">Environment Configuration</a> •
  <a href="#testing">Testing</a> •
  <a href="#deploy">Deploy</a> •
  <a href="#security">Security</a> •
  <a href="#troubleshooting">Troubleshooting</a>  •
  <a href="#license">License</a> •
  <a href="#related-projects">Related Projects</a>
</p>

> ⚠️ **Heads up**: this is a demo/development environment. Don't use real production credentials outside a controlled deployment.

<h2 id="about">📌 About</h2>

**Smart Option Admin** is the admin panel for the **Smart Option** platform, built to handle its day-to-day operations. Through it, the admin team manages users, approves financial requests, tracks the referral network, monitors key metrics, and administers access profiles and permissions.

Built with **Next.js (App Router)** and **Material UI**, the panel consumes the **Smart Option Backend** API, keeping all business logic centralized on the backend.

Communication with the API follows the **BFF (Backend for Frontend)** pattern: the browser never talks to the backend directly and never touches an auth token. Every request goes through Next.js **Route Handlers**, which store tokens in `HttpOnly` cookies — an extra layer of security by design.

<h2 id="architecture">🏗️ Architecture</h2>

Structured by responsibility, keeping domain, infrastructure, interface, and reusable components cleanly separated.

```text
config/          → application configuration and environment validation
domain/          → API contracts, DTOs, permissions, and shared rules
infrastructure/  → backend communication, session management, and services
components/      → Design System and reusable UI components
app/             → pages, layouts, Route Handlers (BFF), and Server Actions
```

### Architectural Principles

- **BFF-driven authentication:** the browser never talks to the backend directly and never handles JWTs. The entire auth flow runs through Next.js Route Handlers, which store tokens in `HttpOnly` cookies.

- **A single, centralized HTTP client:** every call to the backend goes through `backend-client`, which owns authentication, error handling, and request standardization.

- **RBAC mirrored from the backend:** permissions shape what the UI shows (menus, buttons, available actions), while the backend remains the final word on authorization.

- **Reusable components:** tables, forms, dialogs, status indicators, and other UI pieces all draw from a shared Design System, keeping things consistent and cutting down on duplication.

- **Optimized rendering:** Server Components, Server Actions, and the App Router work together to ship less JavaScript to the browser and keep the app fast.

<h2 id="features">✨ Features</h2>

### 📊 Dashboard

- Real-time platform metrics (users, balance, and plans).
- Date-range filters for tracking key indicators.

### 👥 User Management

- Server-side listing, search, and filters.
- Creating, editing, and viewing users.
- Transaction history, withdrawals, and referral network per user.
- Locking and unlocking accounts.
- Manual balance adjustments (audited on the backend).

### 💳 Request Management

- Approving and rejecting withdrawals.
- Tracking deposits, subscriptions, and support tickets.
- Referral network and requests with server-side pagination and filters.

### 🛡️ Administration

- Managing the admin team.
- Full CRUD for roles and permissions (RBAC).
- Managing the logged-in user's account details.
- Changing passwords.

### 🔒 Security

- Authentication protected by the BFF and `HttpOnly` cookies.
- Permission checks that mirror the backend's own rules.
- Content Security Policy (CSP) and other security headers, configured through Next.js.

<h2 id="stack">🛠️ Stack</h2>

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript 5 |
| UI | [Material UI (MUI)](https://mui.com/) 9, Emotion |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Validation | [Zod](https://zod.dev/) (DTOs, API contracts, and environment variables) |
| Auth | BFF (Backend for Frontend), `HttpOnly` cookies, and Server Actions |
| Testing | [Vitest](https://vitest.dev/) + Testing Library (unit/integration), [Playwright](https://playwright.dev/) (E2E) |
| Deploy | Docker multi-stage (`output: standalone`), Docker Compose, and [Caddy](https://caddyserver.com/) (automatic TLS via Let's Encrypt) |

<h2 id="structure">📁 Structure</h2>

```text
src/
├─ config/                  # Application configuration and environment validation
├─ domain/                  # DTOs, API contracts, permissions, and shared constants
├─ infrastructure/          # Backend communication, session, cookies, and HTTP clients
├─ components/              # Design System, reusable components, and app layout
├─ theme/                   # Theme, typography, colors, and design tokens
└─ app/                     # App Router (pages, layouts, Route Handlers, and Server Actions)
   ├─ api/                  # BFF layer handling auth and backend integration
   ├─ login/                # Authentication
   ├─ design-system/        # Catalog of reusable components
   └─ (dashboard)/          # Authenticated area of the app

middleware.ts               # Route protection and initial session check
e2e/                        # End-to-end tests (Playwright)
public/                     # Static assets
Caddyfile                   # Caddy configuration for production
```

<h2 id="routes">📍 Routes</h2>

### 🔐 Auth

| Route | Description |
|---|---|
| `/login` | Authentication for the admin team |

### 📊 Dashboard

| Route | Description |
|---|---|
| `/` | Dashboard with metrics and date-range filters |

### 👥 Users

| Route | Description |
|---|---|
| `/users` | Lists and searches users |
| `/users/create` | Registers a new user |
| `/users/[id]/edit` | Edits a user |
| `/users/[id]` | User profile (transactions, network, and requests) |
| `/users/view/[view]` | Auxiliary views |

### 💳 Requests

| Route | Description |
|---|---|
| `/requests` | Deposits, withdrawals, subscriptions, support, and referral network |

### 🛡️ Administration

| Route | Description |
|---|---|
| `/team` | Team management |
| `/team/create` | Registers a new team member |
| `/team/[id]/edit` | Edits a team member |
| `/team/roles` | Roles and permissions |
| `/team/roles/create` | Creates a new role |
| `/team/roles/[id]/edit` | Edits a role |
| `/account-settings` | Personal details and password change |

### 🎨 Development

| Route | Description |
|---|---|
| `/design-system` | Catalog and live preview of the Design System's components |

---

### 🌐 API (BFF)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Logs in and creates the session (`HttpOnly`). |
| POST | `/api/auth/refresh` | Refreshes the auth tokens. |
| POST | `/api/auth/logout` | Ends the session and clears the cookies. |
| GET | `/api/auth/me` | Returns the authenticated user. |
| GET | `/api/health` | Health endpoint used by Docker. |

<h2 id="getting-started">▶️ Getting Started (local development)</h2>

### Requirements

- Node.js 24+ (only needed to run outside Docker)
- Docker + Docker Compose
- The **Smart Option** backend running (API + Bot)

## Via Docker (recommended)

```bash
git clone <repository-url> smart-option-admin
cd smart-option-admin

cp .env.example .env.local
```

If needed, adjust the backend URL in `.env.local`.

Then:

```bash
docker compose -f docker-compose.dev.yml up -d
```

The app will be available at:

```
http://localhost:<APP_PORT>
```

The environment uses **hot reload** via bind mount, so changes in `src/` show up instantly, no image rebuild needed.

## Without Docker

```bash
git clone <repository-url> smart-option-admin
cd smart-option-admin

npm install

cp .env.example .env.local

npm run dev
```

The app will be available at:

```
http://localhost:<APP_PORT>
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the dev environment with hot reload (Next.js + Turbopack) |
| `npm run build` | Builds the optimized production bundle |
| `npm start` | Runs the app in production mode |
| `npm run typecheck` | Runs TypeScript's type checker |
| `npm run lint` / `npm run lint:fix` | Lints the codebase with ESLint, optionally auto-fixing |
| `npm run format` | Formats the codebase with Prettier |
| `npm test` | Runs the test suite (Vitest) |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run test:coverage` | Generates the test coverage report |
| `npm run test:e2e` | Runs the end-to-end tests with Playwright |

## First Login

Once the frontend is running, log in with the admin user created by the backend's seed:

| Field | Value |
|---|---|
| Email | `admin@admin.com` |
| Password | `password` |

> The backend needs to be running before you start the admin panel.

<h2 id="environment-configuration">⚙️ Environment Configuration</h2>

The project uses a single example file, [.env.example](.env.example), covering every variable needed for both development and production.

For development, copy it to `.env.local`:

```bash
cp .env.example .env.local
```

For production, copy it to `.env`:

```bash
cp .env.example .env
```

Every variable the application reads is validated at startup by `src/config/env.ts` (Zod). If a required one is missing or invalid, the app won't start, and it tells you exactly which setting needs fixing.

| Variable | Description |
|---|---|
| `APP_PORT` | The port the application listens on. |
| `BASE_URL` | The Smart Option backend URL the BFF uses to call the API. Never exposed to the browser. |
| `DOMAIN` *(production)* | The admin panel's public domain. Used by Caddy to serve the app and issue TLS certificates automatically. |
| `ACME_EMAIL` *(production)* | The email Let's Encrypt uses for TLS certificate notifications. |

<h2 id="testing">🧪 Testing</h2>

Run the tests with:

```bash
npm test                # Vitest (unit and integration)
npm run test:coverage   # coverage report
npm run test:e2e        # Playwright (end-to-end)
```

The suite is split into two levels:

- **Vitest + Testing Library**: covers components, utilities, validation, backend contracts, and BFF integrations.
- **Playwright**: validates the app's main flows against the real backend, including authentication, the dashboard, user management, requests, team, roles, RBAC, and account settings.

Running the full suite requires the **Smart Option Backend** to be up (see the backend repository).

> **Note**
>
> The backend applies rate limiting to authentication. Running many login tests back-to-back can trigger a **429 (Too Many Requests)** response. If that happens, wait for the window to reset, or clear the corresponding key in the backend's Redis.

<h2 id="deploy">🚀 Deploy</h2>

The panel can be deployed independently of the backend, either on its own VPS or sharing infrastructure on a different domain or subdomain.

The app relies on:

- **Docker** (multi-stage build)
- **Next.js standalone output**
- **Docker Compose**
- **Caddy** as the reverse proxy, with automatic TLS issuance and renewal (Let's Encrypt)

### Deploy

```bash
cp .env.example .env
```

Set the production variables:

- `APP_PORT`
- `BASE_URL` (the Smart Option backend's public URL)
- `DOMAIN`
- `ACME_EMAIL`

Then run:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy automatically detects the configured domain, issues the TLS certificate on first boot, and handles renewals on its own — no extra proxy or Certbot setup required.

To watch the app start up:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

To check on certificate issuance:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

<h2 id="security">🔒 Security</h2>

The panel's security model focuses on protecting authentication, isolating the client from the backend, and controlling access to admin features.

- **Authentication:** the browser never receives or handles JWTs directly. All authentication runs through the BFF, which stores tokens exclusively in `httpOnly` cookies.
- **Backend communication:** every authenticated request goes through Next.js Route Handlers, which attach tokens and refresh the session as needed.
- **Access control (RBAC):** the UI enables or hides actions based on the user's permissions, mirroring the backend's rules — the backend remains the final authority on authorization.
- **Route protection:** `middleware.ts` blocks access to authenticated pages when there's no valid session, avoiding unnecessary rendering.
- **Security headers:** every response includes policies like Content Security Policy (CSP), HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- **Configuration management:** URLs and other settings come from environment variables — nothing sensitive is hardcoded in the source.

<h2 id="troubleshooting">🛠️ Troubleshooting</h2>

### Backend unreachable (`BACKEND_UNREACHABLE`)

Check that the **Smart Option Backend** is running and that `BASE_URL` points to the right URL.

When both projects run via Docker, use `host.docker.internal` to reach the backend from the panel's container. Inside the container, `localhost` refers to the panel itself, not the backend.

### Port already in use (`EADDRINUSE`)

Another process is already using the port set in `APP_PORT`.

When running the backend and the panel at the same time, use different ports (by default, **3000** for the backend and **3001** for the panel).

### 429 errors during tests

The backend applies **rate limiting** to authentication. Running many login tests back-to-back can temporarily exhaust that limit.

Wait for the window to reset, or clear the corresponding key in the backend's Redis (see the [Testing](#testing) section).

### Changes aren't showing up in Docker

If code changes don't show up right away, make sure the bind mounts are set up correctly in `docker-compose.dev.yml`.

After changing the Docker configuration, recreate the containers:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

<h2 id="license">📄 License</h2>

This project is distributed under the **Smart Option Source Available License (SSAL)**.

You are welcome to:

- study the source code;
- fork the repository for educational purposes;
- use parts of the implementation as a learning reference.

You may **not**:

- use this project commercially;
- deploy it as a product or service;
- build investment, MLM, HYIP, Ponzi, pyramid, betting, or similar financial platforms from this code.

See the [LICENSE](LICENSE) file for the complete terms.

<h2 id="related-projects">🔗 Related Projects</h2>

| Project | Description | Repository |
|----------|-----------|-------------|
| ⚙️ Backend (API + Bot) | API and Telegram bot behind the business logic, authentication, payments, notifications, and integrations the admin panel relies on. | https://github.com/issagomesdev/smart-option |
