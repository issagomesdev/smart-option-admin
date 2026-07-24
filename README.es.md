<p align="center">
  <a href="./README.md">🇺🇸 English</a> |
  <a href="./README.pt-BR.md">🇧🇷 Português</a> |
  <b>🇪🇸 Español</b>
</p>

# 📊 Smart Option — Panel Administrativo

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-9.x-007FFF?style=for-the-badge&logo=mui&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <a href="#acerca-de">Acerca de</a> •
  <a href="#arquitectura">Arquitectura</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#stack">Stack</a> •
  <a href="#estructura">Estructura</a> •
  <a href="#rutas">Rutas</a> •
  <a href="#primeros-pasos">Primeros Pasos</a> •
  <a href="#configuracion-de-entornos">Configuración de Entornos</a> •
  <a href="#pruebas">Pruebas</a> •
  <a href="#despliegue">Despliegue</a> •
  <a href="#seguridad">Seguridad</a> •
  <a href="#solucion-de-problemas">Solución de Problemas</a> •
  <a href="#licencia">Licencia</a> •
  <a href="#related-projects">Proyectos Relacionados</a>
</p>

> ⚠️ **Aviso**: este es un entorno de demostración/desarrollo. No uses credenciales reales de producción fuera de un despliegue controlado.

<h2 id="acerca-de">📌 Acerca de</h2>

**Smart Option Admin** es el panel administrativo de la plataforma **Smart Option**, encargado de la gestión operativa de la aplicación. A través de él, el equipo administrativo gestiona usuarios, aprueba solicitudes financieras, hace seguimiento de la red de afiliados, monitorea indicadores clave y administra perfiles de acceso y permisos.

Construido con **Next.js (App Router)** y **Material UI**, el panel consume la API del **Smart Option Backend**, manteniendo toda la lógica de negocio centralizada en el backend.

La comunicación con la API sigue el patrón **BFF (Backend for Frontend)**: el navegador nunca se comunica directamente con el backend ni tiene acceso a los tokens de autenticación. Todas las solicitudes pasan por los **Route Handlers** de Next.js, que almacenan los tokens en cookies `HttpOnly` — una capa extra de seguridad por diseño.

<h2 id="arquitectura">🏗️ Arquitectura</h2>

Estructura organizada por responsabilidades, separando dominio, infraestructura, interfaz y componentes reutilizables.

```text
config/          → configuración de la aplicación y validación del entorno
domain/          → contratos de la API, DTOs, permisos y reglas compartidas
infrastructure/  → comunicación con el backend, gestión de sesión y servicios
components/      → Design System y componentes reutilizables de la interfaz
app/             → páginas, layouts, Route Handlers (BFF) y Server Actions
```

### Principios Arquitectónicos

- **Autenticación vía BFF:** el navegador nunca accede al backend directamente ni maneja tokens JWT. Todo el flujo de autenticación pasa por los Route Handlers de Next.js, que almacenan los tokens en cookies `HttpOnly`.

- **Cliente HTTP centralizado:** toda comunicación con el backend pasa por `backend-client`, encargado de la autenticación, el manejo de errores y la estandarización de las solicitudes.

- **RBAC reflejado del backend:** los permisos controlan la experiencia de la interfaz (menús, botones y acciones disponibles), mientras que la validación definitiva sigue siendo responsabilidad del backend.

- **Componentes reutilizables:** tablas, formularios, diálogos, indicadores de estado y demás elementos visuales siguen un Design System propio, manteniendo la consistencia y reduciendo la duplicación.

- **Renderizado optimizado:** uso de Server Components, Server Actions y App Router para reducir el JavaScript enviado al navegador y mejorar el rendimiento de la aplicación.

<h2 id="funcionalidades">✨ Funcionalidades</h2>

### 📊 Dashboard

- Métricas en tiempo real de la plataforma (usuarios, saldo y planes).
- Filtros por período para hacer seguimiento de los indicadores.

### 👥 Gestión de Usuarios

- Listado, búsqueda y filtros server-side.
- Registro, edición y visualización de usuarios.
- Historial de movimientos, retiros y red de afiliados.
- Bloqueo y desbloqueo de cuentas.
- Ajuste manual de saldo (auditado por el backend).

### 💳 Gestión de Solicitudes

- Aprobación y rechazo de retiros.
- Seguimiento de depósitos, contrataciones y tickets de soporte.
- Red de afiliados y solicitudes con paginación y filtros server-side.

### 🛡️ Administración

- Gestión del equipo administrativo.
- CRUD completo de roles y permisos (RBAC).
- Configuración de los datos de la cuenta del usuario autenticado.
- Cambio de contraseña.

### 🔒 Seguridad

- Autenticación protegida por el BFF y cookies `HttpOnly`.
- Control de permisos integrado con el backend.
- Content Security Policy (CSP) y demás encabezados de seguridad configurados por Next.js.

<h2 id="stack">🛠️ Stack</h2>

| Categoría | Tecnologías |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript 5 |
| Interfaz | [Material UI (MUI)](https://mui.com/) 9, Emotion |
| Formularios | React Hook Form + Zod (`@hookform/resolvers`) |
| Validación | [Zod](https://zod.dev/) (DTOs, contratos de la API y variables de entorno) |
| Autenticación | BFF (Backend for Frontend), cookies `HttpOnly` y Server Actions |
| Pruebas | [Vitest](https://vitest.dev/) + Testing Library (unitarias e integración), [Playwright](https://playwright.dev/) (E2E) |
| Despliegue | Docker multi-stage (`output: standalone`), Docker Compose y [Caddy](https://caddyserver.com/) (TLS automático vía Let's Encrypt) |

<h2 id="estructura">📁 Estructura</h2>

```text
src/
├─ config/                  # Configuración de la aplicación y validación del entorno
├─ domain/                  # DTOs, contratos de la API, permisos y constantes compartidas
├─ infrastructure/          # Comunicación con el backend, sesión, cookies y clients HTTP
├─ components/              # Design System, componentes reutilizables y layout de la aplicación
├─ theme/                   # Tema, tipografía, colores y tokens de diseño
└─ app/                     # App Router (páginas, layouts, Route Handlers y Server Actions)
   ├─ api/                  # Capa BFF encargada de la autenticación e integración con el backend
   ├─ login/                # Autenticación
   ├─ design-system/        # Catálogo de componentes reutilizables
   └─ (dashboard)/          # Área autenticada de la aplicación

middleware.ts               # Protección de rutas y validación inicial de sesión
e2e/                        # Pruebas end-to-end (Playwright)
public/                     # Archivos estáticos
Caddyfile                   # Configuración de Caddy para producción
```

<h2 id="rutas">📍 Rutas</h2>

### 🔐 Autenticación

| Ruta | Descripción |
|---|---|
| `/login` | Autenticación del equipo administrativo |

### 📊 Dashboard

| Ruta | Descripción |
|---|---|
| `/` | Dashboard con métricas y filtros por período |

### 👥 Usuarios

| Ruta | Descripción |
|---|---|
| `/users` | Listado y búsqueda de usuarios |
| `/users/create` | Registro de usuario |
| `/users/[id]/edit` | Edición de usuario |
| `/users/[id]` | Perfil del usuario (movimientos, red y solicitudes) |
| `/users/view/[view]` | Vistas auxiliares |

### 💳 Solicitudes

| Ruta | Descripción |
|---|---|
| `/requests` | Depósitos, retiros, contrataciones, soporte y red de afiliados |

### 🛡️ Administración

| Ruta | Descripción |
|---|---|
| `/team` | Gestión del equipo |
| `/team/create` | Registro de colaborador |
| `/team/[id]/edit` | Edición de colaborador |
| `/team/roles` | Roles y permisos |
| `/team/roles/create` | Registro de rol |
| `/team/roles/[id]/edit` | Edición de rol |
| `/account-settings` | Datos personales y cambio de contraseña |

### 🎨 Desarrollo

| Ruta | Descripción |
|---|---|
| `/design-system` | Catálogo y preview de los componentes del Design System |

---

### 🌐 API (BFF)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicia sesión y crea la sesión (`HttpOnly`). |
| POST | `/api/auth/refresh` | Renueva los tokens de autenticación. |
| POST | `/api/auth/logout` | Cierra la sesión y elimina las cookies. |
| GET | `/api/auth/me` | Devuelve el usuario autenticado. |
| GET | `/api/health` | Endpoint de salud usado por Docker. |

<h2 id="primeros-pasos">▶️ Primeros Pasos (desarrollo local)</h2>

### Requisitos

- Node.js 24+ (solo necesario para ejecutar fuera de Docker)
- Docker + Docker Compose
- Backend **Smart Option** en ejecución (API + Bot)

## Con Docker (recomendado)

```bash
git clone <url-del-repositorio> smart-option-admin
cd smart-option-admin

cp .env.example .env.local
```

Si es necesario, ajusta la URL del backend en `.env.local`.

Luego:

```bash
docker compose -f docker-compose.dev.yml up -d
```

La aplicación quedará disponible en:

```
http://localhost:<APP_PORT>
```

El entorno usa **hot reload** vía bind mount: los cambios en `src/` se reflejan al instante, sin necesidad de reconstruir la imagen.

## Sin Docker

```bash
git clone <url-del-repositorio> smart-option-admin
cd smart-option-admin

npm install

cp .env.example .env.local

npm run dev
```

La aplicación quedará disponible en:

```
http://localhost:<APP_PORT>
```

## Scripts Disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el entorno de desarrollo con hot reload (Next.js + Turbopack) |
| `npm run build` | Genera la versión optimizada para producción |
| `npm start` | Inicia la aplicación en modo producción |
| `npm run typecheck` | Ejecuta la verificación de tipos de TypeScript |
| `npm run lint` / `npm run lint:fix` | Analiza y corrige problemas de lint con ESLint |
| `npm run format` | Formatea el código con Prettier |
| `npm test` | Ejecuta la suite de pruebas (Vitest) |
| `npm run test:watch` | Ejecuta las pruebas en modo observación |
| `npm run test:coverage` | Genera el reporte de cobertura de pruebas |
| `npm run test:e2e` | Ejecuta las pruebas end-to-end con Playwright |

## Primer Acceso

Una vez que el frontend esté corriendo, inicia sesión con el usuario administrador creado por el seed del backend:

| Campo | Valor |
|---|---|
| Correo | `admin@admin.com` |
| Contraseña | `password` |

> El backend debe estar en ejecución antes de iniciar el panel administrativo.

<h2 id="configuracion-de-entornos">⚙️ Configuración de Entornos</h2>

El proyecto usa un único archivo de ejemplo, [.env.example](.env.example), con todas las variables necesarias tanto para desarrollo como para producción.

En desarrollo, cópialo a `.env.local`:

```bash
cp .env.example .env.local
```

En producción, cópialo a `.env`:

```bash
cp .env.example .env
```

Todas las variables que usa la aplicación se validan al iniciar mediante `src/config/env.ts` (Zod). Si falta alguna obligatoria o tiene un valor inválido, la aplicación no arranca e indica exactamente qué configuración corregir.

| Variable | Descripción |
|---|---|
| `APP_PORT` | Puerto en el que se inicia la aplicación. |
| `BASE_URL` | URL del backend de Smart Option que usa el BFF para consumir la API. Nunca se expone al navegador. |
| `DOMAIN` *(producción)* | Dominio público del panel administrativo. Usado por Caddy para servir la aplicación y emitir certificados TLS automáticamente. |
| `ACME_EMAIL` *(producción)* | Correo usado por Let's Encrypt para notificaciones relacionadas con el certificado TLS. |

<h2 id="pruebas">🧪 Pruebas</h2>

Ejecuta las pruebas con:

```bash
npm test                # Vitest (unitarias e integración)
npm run test:coverage   # reporte de cobertura
npm run test:e2e        # Playwright (end-to-end)
```

La suite está dividida en dos niveles:

- **Vitest + Testing Library**: cubre componentes, utilidades, validaciones, contratos con el backend e integraciones del BFF.
- **Playwright**: valida los principales flujos de la aplicación contra el backend real, incluyendo autenticación, dashboard, gestión de usuarios, solicitudes, equipo, roles, RBAC y configuración de cuenta.

Para ejecutar toda la suite, el **Smart Option Backend** debe estar en ejecución (consulta el repositorio del backend).

> **Nota**
>
> El backend aplica rate limiting en la autenticación. Si se ejecutan muchas pruebas de login en secuencia, puede producirse una respuesta **429 (Too Many Requests)**. En ese caso, espera a que expire la ventana o limpia la clave correspondiente en el Redis del backend.

<h2 id="despliegue">🚀 Despliegue</h2>

El panel puede desplegarse de forma independiente del backend, usando una VPS propia o compartiendo la misma infraestructura en otro dominio o subdominio.

La aplicación usa:

- **Docker** (build multi-stage)
- **Next.js Standalone Output**
- **Docker Compose**
- **Caddy** como reverse proxy, con emisión y renovación automática de certificados TLS (Let's Encrypt)

### Despliegue

```bash
cp .env.example .env
```

Configura las variables de producción:

- `APP_PORT`
- `BASE_URL` (URL pública del Smart Option Backend)
- `DOMAIN`
- `ACME_EMAIL`

Luego ejecuta:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy detecta automáticamente el dominio configurado, emite el certificado TLS en la primera ejecución y se encarga de las renovaciones por su cuenta, sin necesidad de configurar un proxy adicional ni Certbot.

Para seguir el arranque de la aplicación:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Para verificar la emisión del certificado:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

<h2 id="seguridad">🔒 Seguridad</h2>

El panel adopta prácticas orientadas a proteger la autenticación, aislar el cliente del backend y controlar el acceso a las funcionalidades administrativas.

- **Autenticación:** el navegador nunca recibe ni maneja JWTs directamente. Toda la autenticación se realiza a través del BFF, que almacena los tokens exclusivamente en cookies `httpOnly`.
- **Comunicación con el backend:** todas las solicitudes autenticadas pasan por los Route Handlers de Next.js, encargados de adjuntar los tokens y renovar la sesión cuando es necesario.
- **Control de acceso (RBAC):** la interfaz habilita u oculta acciones según los permisos del usuario, reflejando las reglas del backend — la autorización definitiva sigue siendo validada por la API.
- **Protección de rutas:** `middleware.ts` impide el acceso a páginas autenticadas cuando no existe una sesión válida, evitando renderizados innecesarios.
- **Encabezados de seguridad:** todas las respuestas incluyen políticas como Content Security Policy (CSP), HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
- **Gestión de configuración:** las URLs y demás ajustes provienen de variables de entorno, sin ningún valor sensible hardcodeado en el código fuente.

<h2 id="solucion-de-problemas">🛠️ Solución de Problemas</h2>

### Backend no disponible (`BACKEND_UNREACHABLE`)

Verifica que el **Smart Option Backend** esté en ejecución y que `BASE_URL` apunte a la URL correcta.

Cuando ambos proyectos corren vía Docker, usa `host.docker.internal` para acceder al backend desde el contenedor del panel. Dentro del contenedor, `localhost` hace referencia al propio panel, no al backend.

### Puerto ya en uso (`EADDRINUSE`)

Otro proceso ya está usando el puerto definido en `APP_PORT`.

Al ejecutar el backend y el panel al mismo tiempo, usa puertos distintos (por defecto, **3000** para el backend y **3001** para el panel).

### Error 429 durante las pruebas

El backend aplica **rate limiting** en la autenticación. Ejecutar muchas pruebas de login en secuencia puede agotar temporalmente ese límite.

Espera a que expire la ventana de tiempo o limpia la clave correspondiente en el Redis del backend (consulta la sección [Pruebas](#pruebas)).

### Los cambios no se reflejan en Docker

Si los cambios en el código no aparecen de inmediato, confirma que los volúmenes (*bind mounts*) estén bien configurados en `docker-compose.dev.yml`.

Después de modificar la configuración de Docker, recrea los contenedores:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```
<h2 id="licencia">📄 Licencia</h2>

Este proyecto se distribuye bajo la **Smart Option Source Available License (SSAL)**.

Se permite:

- estudiar el código fuente;
- realizar un fork del repositorio con fines educativos;
- utilizar partes de la implementación como referencia de aprendizaje.

No está permitido:

- utilizar este proyecto con fines comerciales;
- ofrecerlo como producto o servicio;
- crear plataformas de inversión, marketing multinivel (MLM), HYIP, esquemas Ponzi, pirámides financieras, apuestas o cualquier otro servicio financiero similar utilizando este código.

Consulta el archivo [LICENSE](LICENSE) para conocer los términos completos de la licencia.

<h2 id="related-projects">🔗 Proyectos Relacionados</h2>

| Proyecto | Descripción | Repositorio |
|----------|-----------|-------------|
| ⚙️ Backend (API + Bot) | API y bot de Telegram detrás de la lógica de negocio, autenticación, pagos, notificaciones e integraciones que usa el panel administrativo. | https://github.com/issagomesdev/smart-option |
