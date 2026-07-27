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
  <a href="#configuration">Configuration</a> •
  <a href="#demo-mode">Demo Mode</a> •
  <a href="#testing">Testing</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#security">Security</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#license">License</a> •
  <a href="#related-projects">Related Projects</a>
</p>

> ⚠️ **Heads-up:** this is a demo/development environment. Don't use real production credentials outside a controlled deployment.

<h2 id="about">📌 About</h2>

**Smart Option Admin** is the **admin panel** for the **Smart Option** platform, built to centralize day-to-day operations and management. From a single place, the admin team tracks real-time metrics, manages users, approves financial requests, monitors the affiliate network, administers investment plans, reviews audited transactions, and controls access profiles and permissions.

This repository holds the admin panel's **frontend**, built with **Next.js (App Router)** and **Material UI**. The app consumes the **Smart Option Backend** REST API, keeping all business logic on the server. Communication follows the **Backend for Frontend (BFF)** pattern: the browser never talks to the API directly and never touches authentication tokens. Every request goes through Next.js **Route Handlers**, which keep tokens in **HttpOnly cookies** — an extra layer of security on top of a more decoupled, scalable architecture.

<h2 id="architecture">🏗️ Architecture</h2>

The codebase is organized by responsibility, separating domain, infrastructure, interface, and reusable components.

```text
config/          → application config and environment validation
domain/          → API contracts, DTOs, permissions, and shared rules
infrastructure/  → backend communication, session management, and services
components/      → Design System and reusable UI components
app/             → pages, layouts, Route Handlers (BFF), and Server Actions
```

### Architectural principles

- **BFF authentication:** the browser never reaches the backend directly or handles JWTs. The entire auth flow goes through Next.js Route Handlers, which store tokens in `HttpOnly` cookies.

- **Centralized HTTP client:** all backend communication goes through `backend-client`, which owns authentication, error handling, and request consistency.

- **RBAC wired to the backend:** permissions shape the UI (menus, buttons, available actions), while the authoritative check always stays on the backend.

- **Reusable components:** tables, forms, dialogs, status indicators, and other UI elements follow a purpose-built Design System, keeping things consistent and avoiding duplication.

- **Optimized rendering:** Server Components, Server Actions, and the App Router keep the JavaScript shipped to the browser small and the app fast.

<h2 id="features">✨ Features</h2>

### 📊 Dashboard

The panel brings the platform's key metrics together into a single operational view.

- Unified dashboard inspired by products like **Stripe**, **Linear**, and **Vercel**, pulling KPIs, charts, and recent activity into a single request.
- Metrics for **active users**, **network balance**, **approved deposits**, **pending withdrawals**, and **financial approvals for the day**, each compared against the previous period.
- Network profitability chart and a recent-activity table with quick access to the full history.
- Period filters (`Today`, `7 days`, `30 days`, or a custom range), plus optional scoping by user or plan.
- Reactive updates, skeleton loading, and polished loading and error states for a smooth experience.

---

### 🔍 Financial Audit

Every financial transaction on the platform lives in a single audit screen.

- Complete history of deposits, withdrawals, earnings, commissions, subscriptions, manual adjustments, and other transactions.
- Advanced search with combinable filters by period, user, type, status, amount range, and free-text search.
- Sorting, server-side pagination, and a detailed view for each transaction.
- Full operation details, including user, identifiers, gateway, responsible admin, timestamps, and notes.
- Export of the filtered results.

---

### 📦 Plan Management

Full administration of the platform's product catalog.

- Create, edit, activate, deactivate, and manage the available plans.
- Search, filters, sorting, and pagination to keep administration quick.
- Support for **AUTO** (instant purchase via PIX) and **MANUAL** (request routed to the support team) models.
- Default plans are protected from deletion, with warnings when a change affects existing subscribers.

---

### 👥 User Management

Complete management of the users registered on the platform.

- Server-side search, filters, and pagination.
- Create, edit, block, and unblock accounts.
- Access to each user's financial history, affiliate network, and requests.
- Manual balance adjustments, fully audited by the backend.

---

### 💳 Financial Operations

A single place for the platform's operational requests.

- Approve or reject withdrawal requests.
- Track deposits, plan subscriptions, and support tickets.
- Browse the affiliate network with filters and pagination.

---

### 🛡️ Administration

Tools for managing the admin environment itself.

- Admin team management.
- Roles and permissions control (**RBAC**).
- Profile settings for the signed-in admin.
- Credential and account preference changes.

---

### 🎭 Demo Mode

A dedicated mode for showing the project publicly.

- Guest sign-in with no credentials required.
- A discreet visual marker identifying the demo environment.
- Irreversible operations blocked at the backend.
- UI that clearly explains when an action isn't available in the demo.

---

### 🔒 Security

Best practices applied throughout the application.

- **Backend for Frontend (BFF)** architecture using **Next.js Route Handlers**.
- Tokens stored exclusively in **HttpOnly cookies**.
- Permission control wired to the backend.
- **Content Security Policy (CSP)**, security headers, and validation on every critical operation.

<h2 id="stack">🛠️ Stack</h2>

| Category | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript 5 |
| **UI** | [Material UI (MUI)](https://mui.com/), Emotion |
| **State management** | React Context API |
| **Forms** | React Hook Form + [Zod](https://zod.dev/) (`@hookform/resolvers`) |
| **Validation** | Zod (forms, API contracts, and environment variables) |
| **API communication** | Fetch API, BFF (Backend for Frontend), Next.js Route Handlers |
| **Authentication** | `HttpOnly` cookies, access token, refresh token, and automatic session renewal |
| **Code quality** | ESLint, Prettier, and TypeScript strict mode |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library (unit and integration), [Playwright](https://playwright.dev/) (E2E) |
| **Infrastructure** | Multi-stage Docker (`output: standalone`), Docker Compose, and [Caddy](https://caddyserver.com/) (automatic TLS via Let's Encrypt) |

<h2 id="structure">📁 Structure</h2>

```text
src/
├─ config/                  # application config and environment validation
├─ domain/                  # DTOs, API contracts, permissions, and shared constants
├─ infrastructure/          # backend communication, session, cookies, and HTTP clients
├─ components/              # Design System, reusable components, and app layout
├─ theme/                   # theme, typography, colors, and design tokens
└─ app/                     # App Router (pages, layouts, Route Handlers, and Server Actions)
   ├─ api/                  # BFF layer handling authentication and backend integration
   ├─ login/                # authentication
   ├─ design-system/        # catalog of reusable components
   └─ (dashboard)/          # authenticated area of the app

middleware.ts               # route protection and initial session validation
e2e/                        # end-to-end tests (Playwright)
public/                     # static assets
Caddyfile                   # Caddy configuration for production
```

<h2 id="routes">📍 Routes</h2>

The admin panel is organized into modules, each dedicated to a specific area of the platform's operation. The main routes are listed below.

### 🔐 Authentication

Access management for the admin panel.

| Route | Description |
|---|---|
| `/login` | Admin team sign-in and panel access. |

---

### 📊 Dashboard

The platform's monitoring hub.

| Route | Description |
|---|---|
| `/` | Main dashboard with KPIs, financial metrics, the network profitability chart, and recent activity, including filters by period, user, and plan. |

---

### 🔍 Financial Audit

Search and tracing of financial transactions.

| Route | Description |
|---|---|
| `/audit` | Complete transaction history, with advanced filters, sorting, operation details, and result export. |

---

### 👥 User Management

Administration of the users registered on the platform.

| Route | Description |
|---|---|
| `/users` | User listing, search, and filters. |
| `/users/create` | Create a new user. |
| `/users/[id]` | Full user profile, including statement, affiliate network, and requests. |
| `/users/[id]/edit` | Edit user details. |
| `/users/view/[view]` | Supporting views related to user management. |

---

### 💳 Financial Operations

Handling of the platform's financial requests.

| Route | Description |
|---|---|
| `/requests` | Management of deposits, withdrawals, plan subscriptions, support tickets, and affiliate network tracking. |

---

### 📦 Plan Management

Administration of the platform's product catalog.

| Route | Description |
|---|---|
| `/plans` | Plan listing with search, filters, sorting, and export. |
| `/plans/create` | Create a new plan. |
| `/plans/[id]/edit` | Edit an existing plan. |

---

### 🛡️ Administration

Management of the admin team and access permissions.

| Route | Description |
|---|---|
| `/team` | Admin team listing and management. |
| `/team/create` | Add a new team member. |
| `/team/[id]/edit` | Edit a team member. |
| `/team/roles` | Roles and permissions management (RBAC). |
| `/team/roles/create` | Create a new role. |
| `/team/roles/[id]/edit` | Edit roles and permissions. |
| `/account-settings` | Account settings for the signed-in admin, including personal details and password changes. |

---

### 🎨 Design System

A dedicated space for building and reviewing UI components.

| Route | Description |
|---|---|
| `/design-system` | Catalog of reusable components, visual tokens, and the previews used while building the interface. |

---

### 🌐 API (BFF)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Signs in and creates the session (`HttpOnly`). |
| POST | `/api/auth/demo-login` | Creates a guest session, no credentials required. Returns 404 when the backend isn't in demo mode. |
| POST | `/api/auth/refresh` | Renews the authentication tokens. |
| POST | `/api/auth/logout` | Ends the session and clears the cookies. |
| GET | `/api/auth/me` | Returns the authenticated user. |
| GET | `/api/health` | Health endpoint used by Docker. |

<h2 id="getting-started">▶️ Getting Started (local development)</h2>

### Requirements

- Node.js 24+ (only needed when running outside Docker)
- Docker + Docker Compose
- **Smart Option** backend up and running (API + bot)

### With Docker (recommended)

```bash
git clone <repository-url> smart-option-admin
cd smart-option-admin

cp .env.example .env.local
```

Adjust the backend URL in `.env.local` if needed.

Then run:

```bash
docker compose -f docker-compose.dev.yml up -d
```

The app will be available at:

```
http://localhost:<APP_PORT>
```

The environment uses **hot reload** through a bind mount, so changes under `src/` are picked up without rebuilding the image.

### Without Docker

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

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the development environment with hot reload (Next.js + Turbopack) |
| `npm run build` | Builds the optimized production bundle |
| `npm start` | Runs the app in production mode |
| `npm run typecheck` | Runs the TypeScript type check |
| `npm run lint` / `npm run lint:fix` | Lints and auto-fixes issues with ESLint |
| `npm run format` | Formats the code with Prettier |
| `npm test` | Runs the test suite (Vitest) |
| `npm run test:watch` | Runs the tests in watch mode |
| `npm run test:coverage` | Generates the test coverage report |
| `npm run test:e2e` | Runs the end-to-end tests with Playwright |

### First sign-in

Once the frontend is running, sign in with the admin user created by the backend seed:

| Field | Value |
|---|---|
| Email | `admin@admin.com` |
| Password | `password` |

> The backend must be running before you start the admin panel.

<h2 id="configuration">⚙️ Configuration</h2>

The project ships a single example file, [.env.example](.env.example), covering every variable needed for development and production.

For development, copy it to `.env.local`:

```bash
cp .env.example .env.local
```

For production, copy it to `.env`:

```bash
cp .env.example .env
```

Every variable the app uses is validated at startup by `src/config/env.ts` (Zod). If a required one is missing or invalid, the app refuses to start and tells you exactly which setting needs fixing.

| Variable | Description |
|---|---|
| `APP_PORT` | Port the app listens on. |
| `BASE_URL` | Smart Option backend URL used by the BFF to reach the API. Never exposed to the browser. |
| `DOMAIN` *(production)* | Public domain of the admin panel. Used by Caddy to serve the app and issue TLS certificates automatically. |
| `ACME_EMAIL` *(production)* | Email used by Let's Encrypt for TLS certificate notifications. |

> The panel has **no** environment variable of its own for demo mode. The backend decides (`APP_DEMO`) and the panel simply follows — that way the two sides can never disagree. See [Demo Mode](#demo-mode).

<h2 id="demo-mode">🎭 Demo Mode</h2>

The admin panel ships a **demo mode** built for presentations, case studies, and portfolio use. When the backend runs with `APP_DEMO=true`, the interface adapts on its own, letting any visitor explore virtually every feature without putting the environment at risk.

No extra frontend configuration is required: demo mode is detected automatically.

### 👤 Guest sign-in

When it's available, the sign-in screen shows an **"Enter as guest"** button, giving access to the panel without any public credentials.

The resulting session behaves exactly like a regular one, so the whole product is available to explore.

### 🛡️ A protected environment

To keep the demo intact, critical operations stay visible but can't be executed. Visitors get to see the complete flow of the application without triggering anything irreversible.

Protected actions include:

- Approving withdrawal requests.
- Managing the admin team.
- Managing roles and permissions.
- Changing admin account details.
- Changing passwords.

Whenever an action is unavailable, the interface says so clearly and explains why.

> **Important:** the restrictions shown in the panel are purely a UI concern. The real protection lives in the backend, which keeps validating permissions and rejecting blocked operations even when a request is sent straight to the API.

<h2 id="testing">🧪 Testing</h2>

Run the tests with:

```bash
npm test                # Vitest (unit and integration)
npm run test:coverage   # coverage report
npm run test:e2e        # Playwright (end-to-end)
```

The suite has two levels:

- **Vitest + Testing Library**: covers components, utilities, validation, backend contracts, and BFF integrations.
- **Playwright**: exercises the main flows against the real backend, including authentication, dashboard, user management, requests, team, roles, RBAC, and account settings.

The **Smart Option Backend** must be running to execute the full suite (see the backend repository).

> **Note**
>
> The backend rate-limits authentication. Running many sign-in tests back to back can trigger a **429 (Too Many Requests)** response. If that happens, wait for the window to expire or clear the corresponding key in the backend's Redis.

<h2 id="deployment">🚀 Deployment</h2>

The panel can be deployed independently of the backend — on its own VPS, or sharing the same infrastructure under a different domain or subdomain.

The application uses:

- **Docker** (multi-stage build)
- **Next.js standalone output**
- **Docker Compose**
- **Caddy** as a reverse proxy, with automatic TLS certificate issuance and renewal (Let's Encrypt)

### Step by step

```bash
cp .env.example .env
```

Set the production variables:

- `APP_PORT`
- `BASE_URL` (public URL of the Smart Option Backend)
- `DOMAIN`
- `ACME_EMAIL`

Then run:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy picks up the configured domain, issues the TLS certificate on first run, and handles renewals on its own — no extra proxy setup, no Certbot.

To follow the application startup:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

To check certificate issuance:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

<h2 id="security">🔒 Security</h2>

The panel is built around protecting authentication, isolating the client from the backend, and controlling access to administrative features.

- **Authentication:** the browser never receives or handles JWTs directly. Authentication runs through the BFF, which keeps tokens exclusively in `httpOnly` cookies.
- **Backend communication:** every authenticated request goes through Next.js Route Handlers, which attach the tokens and refresh the session when needed.
- **Access control (RBAC):** the interface enables or hides actions based on the user's permissions, mirroring the backend rules. Final authorization is always validated by the API.
- **Route protection:** `middleware.ts` blocks access to authenticated pages when there's no valid session, avoiding unnecessary renders.
- **Security headers:** every response includes policies such as Content Security Policy (CSP), HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- **Configuration management:** URLs and other settings come from environment variables — no sensitive values hardcoded in the source.

<h2 id="troubleshooting">🛠️ Troubleshooting</h2>

### Backend unreachable (`BACKEND_UNREACHABLE`)

Check that the **Smart Option Backend** is running and that `BASE_URL` points to the right URL.

When both projects run in Docker, use `host.docker.internal` to reach the backend from the panel's container. Inside the container, `localhost` refers to the panel itself, not the backend.

### Port already in use (`EADDRINUSE`)

Another process is already using the port set in `APP_PORT`.

When running the backend and the panel at the same time, use different ports (by default, **3000** for the backend and **3001** for the panel).

### 429 errors during tests

The backend **rate-limits** authentication. Running many sign-in tests in a row can temporarily exhaust that limit.

Wait for the time window to expire or clear the corresponding key in the backend's Redis (see the [Testing](#testing) section).

### Changes not showing up in Docker

If code changes don't appear right away, confirm that the volumes (*bind mounts*) are set up correctly in `docker-compose.dev.yml`.

After changing the Docker configuration, recreate the containers:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

<h2 id="license">📄 License</h2>

This project is distributed under the **Smart Option Source Available License (SSAL)**.

You may:

- study the source code;
- fork the repository for educational purposes;
- use parts of the implementation as a learning reference.

You may **not**:

- use this project for commercial purposes;
- offer it as a product or service;
- build investment platforms, multi-level marketing (MLM), HYIP, Ponzi schemes, financial pyramids, gambling, or any similar financial service on top of this code.

See the [LICENSE](LICENSE) file for the full terms.

<h2 id="related-projects">🔗 Related Projects</h2>

**Smart Option** was built as an ecosystem of independent applications, each with a clear responsibility. Splitting it across repositories keeps things organized, makes parallel development easier, and results in a more modular, scalable architecture.

| Project | Description | Repository |
|----------|-----------|-------------|
| 🌐 Landing Page | The official Smart Option landing page, built to introduce the platform, what sets it apart, and the experience it offers users. | https://github.com/issagomesdev/smart-option-page |
| ⚙️ Backend (API + Bot) | The API and Telegram bot behind the business rules, authentication, payments, notifications, and integrations used by the admin panel. | https://github.com/issagomesdev/smart-option |
