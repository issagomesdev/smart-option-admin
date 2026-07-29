<p align="center">
  <a href="./README.md">🇺🇸 English</a> |
  <a href="./README.pt-BR.md">🇧🇷 Português</a> |
  <b>🇪🇸 Español</b>
</p>

# 📊 Smart Option — Panel Administrativo

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-9.x-007FFF?style=for-the-badge&logo=mui&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <a href="#acerca">Acerca del proyecto</a> •
  <a href="#arquitectura">Arquitectura</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#stack">Stack</a> •
  <a href="#estructura">Estructura</a> •
  <a href="#rutas">Rutas</a> •
  <a href="#primeros-pasos">Primeros pasos</a> •
  <a href="#configuracion">Configuración</a> •
  <a href="#modo-demo">Modo Demostración</a> •
  <a href="#pruebas">Pruebas</a> •
  <a href="#despliegue">Despliegue</a> •
  <a href="#seguridad">Seguridad</a> •
  <a href="#solucion-de-problemas">Solución de problemas</a> •
  <a href="#licencia">Licencia</a> •
  <a href="#proyectos-relacionados">Proyectos relacionados</a>
</p>

> ⚠️ **Aviso:** este es un entorno de demostración/desarrollo. No uses credenciales reales de producción fuera de un despliegue controlado.

<h2 id="acerca">📌 Acerca del proyecto</h2>

**Smart Option Admin** es el **panel administrativo** de la plataforma **Smart Option**, creado para centralizar la operación y la gestión del día a día. Desde un solo lugar, el equipo administrativo consulta métricas en tiempo real, gestiona usuarios, aprueba solicitudes financieras, monitorea la red de afiliados, administra los planes de inversión, revisa movimientos auditados y controla los perfiles de acceso y permisos.

Este repositorio contiene el **frontend** del panel administrativo, desarrollado con **Next.js (App Router)** y **Material UI**. La aplicación consume la **API REST** del **Smart Option Backend**, manteniendo toda la lógica de negocio en el servidor. La comunicación sigue el patrón **Backend for Frontend (BFF)**: el navegador nunca accede directamente a la API ni tiene contacto con los tokens de autenticación. Todas las peticiones pasan por los **Route Handlers** de Next.js, que guardan los tokens en **cookies HttpOnly**, agregando una capa extra de seguridad sobre una arquitectura más desacoplada y escalable.

<h2 id="arquitectura">🏗️ Arquitectura</h2>

El código está organizado por responsabilidades, separando dominio, infraestructura, interfaz y componentes reutilizables.

```text
config/          → configuración de la aplicación y validación del entorno
domain/          → contratos de la API, DTOs, permisos y reglas compartidas
infrastructure/  → comunicación con el backend, manejo de sesión y servicios
components/      → Design System y componentes reutilizables de la interfaz
app/             → páginas, layouts, Route Handlers (BFF) y Server Actions
```

### Principios arquitectónicos

- **Autenticación mediante BFF:** el navegador nunca accede al backend directamente ni manipula JWTs. Todo el flujo de autenticación pasa por los Route Handlers de Next.js, que guardan los tokens en cookies `HttpOnly`.

- **Cliente HTTP centralizado:** toda la comunicación con el backend pasa por `backend-client`, responsable de la autenticación, el manejo de errores y la consistencia de las peticiones.

- **RBAC alineado con el backend:** los permisos definen la experiencia de la interfaz (menús, botones y acciones disponibles), mientras que la validación definitiva siempre queda del lado del backend.

- **Componentes reutilizables:** tablas, formularios, diálogos, indicadores de estado y demás elementos visuales siguen un Design System propio, lo que mantiene la consistencia y evita duplicación.

- **Renderizado optimizado:** el uso de Server Components, Server Actions y App Router reduce el JavaScript enviado al navegador y mejora el rendimiento de la aplicación.

<h2 id="funcionalidades">✨ Funcionalidades</h2>

### 📊 Dashboard

El panel reúne los principales indicadores de la plataforma en una única vista operativa.

- Dashboard unificado inspirado en productos como **Stripe**, **Linear** y **Vercel**, que agrupa KPIs, gráficos y movimientos recientes en una sola consulta.
- Indicadores de **usuarios activos**, **saldo de la red**, **depósitos aprobados**, **retiros pendientes** y **aprobaciones financieras del día**, con comparación respecto al período anterior.
- Gráfico de evolución de la rentabilidad de la red y tabla de movimientos recientes con acceso rápido al historial completo.
- Filtros por período (`Hoy`, `7 días`, `30 días` o personalizado), además de segmentaciones opcionales por usuario o plan.
- Actualización reactiva, *skeleton loading* y estados de carga y error cuidados para una experiencia fluida.

---

### 🔍 Auditoría

Dos rastros complementarios en la misma pantalla, organizados en pestañas.

**Movimientos** — todos los movimientos financieros de la plataforma.

- Historial completo de depósitos, retiros, rendimientos, comisiones, suscripciones, ajustes administrativos y demás transacciones.
- Búsqueda avanzada con filtros combinables por período, usuario, tipo, estado, rango de montos y búsqueda por texto.
- Ordenamiento, paginación del lado del servidor y vista detallada de cada movimiento.
- Información completa de la operación, incluyendo usuario, identificadores, gateway, administrador responsable, fechas y observaciones.
- Exportación de los resultados filtrados.

**Acciones administrativas** — quién modificó qué en el panel.

- Registro de cada cambio en el equipo, los roles, los usuarios del bot, los bloqueos, los ajustes de saldo, las respuestas a retiros y los cierres de soporte.
- Autor, fecha y hora, y el estado antes y después de cada cambio, con detalle por registro.
- Filtros por período, área y tipo de acción, además de búsqueda por autor o registro, con exportación.
- El correo del autor se conserva aunque su cuenta se elimine después.

---

### 📦 Gestión de Planes

Administración completa del catálogo de productos de la plataforma.

- Alta, edición, activación, desactivación y gestión de los planes disponibles.
- Búsqueda, filtros, ordenamiento y paginación para agilizar la administración.
- Soporte para los modelos **AUTO** (compra inmediata vía PIX) y **MANUAL** (solicitud enviada al equipo de soporte).
- Los planes predeterminados están protegidos contra eliminación, con alertas cuando un cambio afecta a suscriptores existentes.

---

### 👥 Gestión de Usuarios

Gestión completa de los usuarios registrados en la plataforma.

- Búsqueda, filtros y paginación del lado del servidor.
- Alta, edición, bloqueo y desbloqueo de cuentas.
- Consulta del historial financiero, la red de afiliados y las solicitudes de cada usuario.
- Ajustes manuales de saldo, totalmente auditados por el backend.

---

### 💳 Gestión Financiera

Un solo lugar para las solicitudes operativas de la plataforma.

- Aprobación o rechazo de solicitudes de retiro.
- Seguimiento de depósitos, suscripciones a planes y tickets de soporte.
- Visualización de la red de afiliados con filtros y paginación.

---

### 🛡️ Administración

Herramientas para gestionar el propio entorno administrativo.

- Gestión del equipo administrativo, incluyendo la edición de nombre y correo y el restablecimiento de la contraseña de los colaboradores.
- Control de roles y permisos (**RBAC**).
- Configuración del perfil del administrador autenticado.
- Cambio de credenciales y preferencias de la cuenta.

---

### 🎭 Modo Demostración

Un modo pensado para presentar el proyecto públicamente.

- Inicio de sesión como visitante, sin necesidad de credenciales.
- Un indicador visual discreto que identifica el entorno de demostración.
- Operaciones irreversibles bloqueadas directamente en el backend.
- Una interfaz que explica con claridad cuándo una acción no está disponible en la demo.

---

### 🔒 Seguridad

Buenas prácticas aplicadas en toda la aplicación.

- Arquitectura **Backend for Frontend (BFF)** con **Route Handlers de Next.js**.
- Tokens almacenados exclusivamente en **cookies HttpOnly**.
- Control de permisos alineado con el backend.
- **Content Security Policy (CSP)**, cabeceras de seguridad y validaciones en todas las operaciones críticas.

<h2 id="stack">🛠️ Stack</h2>

| Categoría | Tecnologías |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript 5 |
| **Interfaz** | [Material UI (MUI)](https://mui.com/), Emotion |
| **Manejo de estado** | React Context API |
| **Formularios** | React Hook Form + [Zod](https://zod.dev/) (`@hookform/resolvers`) |
| **Validación** | Zod (formularios, contratos de la API y variables de entorno) |
| **Comunicación con la API** | Fetch API, BFF (Backend for Frontend), Route Handlers de Next.js |
| **Autenticación** | Cookies `HttpOnly`, access token, refresh token y renovación automática de sesión |
| **Calidad de código** | ESLint, Prettier y TypeScript en modo strict |
| **Pruebas** | [Vitest](https://vitest.dev/) + Testing Library (unitarias e integración), [Playwright](https://playwright.dev/) (E2E) |
| **Infraestructura** | Docker multi-stage (`output: standalone`), Docker Compose y [Caddy](https://caddyserver.com/) (TLS automático vía Let's Encrypt) |

<h2 id="estructura">📁 Estructura</h2>

```text
src/
├─ config/                  # configuración de la aplicación y validación del entorno
├─ domain/                  # DTOs, contratos de la API, permisos y constantes compartidas
├─ infrastructure/          # comunicación con el backend, sesión, cookies y clients HTTP
├─ components/              # Design System, componentes reutilizables y layout de la aplicación
├─ theme/                   # tema, tipografía, colores y tokens de diseño
└─ app/                     # App Router (páginas, layouts, Route Handlers y Server Actions)
   ├─ api/                  # capa BFF encargada de la autenticación y la integración con el backend
   ├─ login/                # autenticación
   ├─ design-system/        # catálogo de componentes reutilizables
   └─ (dashboard)/          # área autenticada de la aplicación

middleware.ts               # protección de rutas y validación inicial de la sesión
e2e/                        # pruebas end-to-end (Playwright)
public/                     # archivos estáticos
Caddyfile                   # configuración de Caddy para producción
```

<h2 id="rutas">📍 Rutas</h2>

El panel administrativo está organizado en módulos, cada uno dedicado a un área específica de la operación de la plataforma. A continuación, las rutas principales.

### 🔐 Autenticación

Gestión del acceso al panel administrativo.

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión del equipo administrativo y acceso al panel. |

---

### 📊 Dashboard

Centro de monitoreo de la plataforma.

| Ruta | Descripción |
|---|---|
| `/` | Dashboard principal con KPIs, indicadores financieros, gráfico de rentabilidad de la red y movimientos recientes, incluyendo filtros por período, usuario y plan. |

---

### 🔍 Auditoría

Consulta y trazabilidad de los movimientos financieros y de las acciones administrativas.

| Ruta | Descripción |
|---|---|
| `/audit` | Auditoría en dos pestañas: movimientos financieros y acciones administrativas, ambas con filtros avanzados, detalle por registro y exportación. |

---

### 👥 Gestión de Usuarios

Administración de los usuarios registrados en la plataforma.

| Ruta | Descripción |
|---|---|
| `/users` | Listado, búsqueda y filtros de usuarios. |
| `/users/create` | Alta de nuevos usuarios. |
| `/users/[id]` | Perfil completo del usuario, incluyendo estado de cuenta, red de afiliados y solicitudes. |
| `/users/[id]/edit` | Edición de los datos del usuario. |
| `/users/view/[view]` | Vistas auxiliares relacionadas con la gestión de usuarios. |

---

### 💳 Gestión Financiera

Operación de las solicitudes financieras de la plataforma.

| Ruta | Descripción |
|---|---|
| `/requests` | Gestión de depósitos, retiros, suscripciones a planes, tickets de soporte y seguimiento de la red de afiliados. |

---

### 📦 Gestión de Planes

Administración del catálogo de productos de la plataforma.

| Ruta | Descripción |
|---|---|
| `/plans` | Listado de planes con búsqueda, filtros, ordenamiento y exportación. |
| `/plans/create` | Alta de nuevos planes. |
| `/plans/[id]/edit` | Edición de un plan existente. |

---

### 🛡️ Administración

Gestión del equipo administrativo y de los permisos de acceso.

| Ruta | Descripción |
|---|---|
| `/team` | Listado y gestión del equipo administrativo. |
| `/team/create` | Alta de nuevos colaboradores. |
| `/team/[id]/edit` | Edición de colaboradores: nombre, apellido, correo, contraseña y rol. |
| `/team/roles` | Gestión de roles y permisos (RBAC). |
| `/team/roles/create` | Alta de nuevos roles. |
| `/team/roles/[id]/edit` | Edición de roles y permisos. |
| `/account-settings` | Configuración de la cuenta del administrador autenticado, incluyendo datos personales y cambio de contraseña. |

---

### 🎨 Design System

Un espacio dedicado al desarrollo y la validación de los componentes de la interfaz.

| Ruta | Descripción |
|---|---|
| `/design-system` | Catálogo de componentes reutilizables, tokens visuales y demostraciones usadas durante el desarrollo de la interfaz. |

---

### 🌐 API (BFF)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicia sesión y crea la sesión (`HttpOnly`). |
| POST | `/api/auth/demo-login` | Crea una sesión de visitante, sin credenciales. Responde 404 cuando el backend no está en modo demostración. |
| POST | `/api/auth/refresh` | Renueva los tokens de autenticación. |
| POST | `/api/auth/logout` | Cierra la sesión y elimina las cookies. |
| GET | `/api/auth/me` | Devuelve el usuario autenticado. |
| GET | `/api/health` | Endpoint de salud utilizado por Docker. |

<h2 id="primeros-pasos">▶️ Primeros pasos (desarrollo local)</h2>

### Requisitos

- Node.js 24+ (solo necesario para ejecutar fuera de Docker)
- Docker + Docker Compose
- Backend **Smart Option** en ejecución (API + bot)

### Con Docker (recomendado)

```bash
git clone <url-del-repositorio> smart-option-admin
cd smart-option-admin

cp .env.example .env.local
```

Si es necesario, ajusta la URL del backend en `.env.local`.

Luego ejecuta:

```bash
docker compose -f docker-compose.dev.yml up -d
```

La aplicación estará disponible en:

```
http://localhost:<APP_PORT>
```

El entorno usa **hot reload** mediante bind mount, por lo que los cambios en `src/` se reflejan sin necesidad de reconstruir la imagen.

### Sin Docker

```bash
git clone <url-del-repositorio> smart-option-admin
cd smart-option-admin

npm install

cp .env.example .env.local

npm run dev
```

La aplicación estará disponible en:

```
http://localhost:<APP_PORT>
```

### Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el entorno de desarrollo con hot reload (Next.js + Turbopack) |
| `npm run build` | Genera la versión optimizada para producción |
| `npm start` | Ejecuta la aplicación en modo producción |
| `npm run typecheck` | Ejecuta la verificación de tipos de TypeScript |
| `npm run lint` / `npm run lint:fix` | Analiza y corrige problemas de lint con ESLint |
| `npm run format` | Formatea el código con Prettier |
| `npm test` | Ejecuta la suite de pruebas (Vitest) |
| `npm run test:watch` | Ejecuta las pruebas en modo watch |
| `npm run test:coverage` | Genera el reporte de cobertura de pruebas |
| `npm run test:e2e` | Ejecuta las pruebas end-to-end con Playwright |

### Primer acceso

Una vez iniciado el frontend, inicia sesión con el usuario administrador creado por el seed del backend:

| Campo | Valor |
|---|---|
| Correo electrónico | `admin@admin.com` |
| Contraseña | `password` |

> El backend debe estar en ejecución antes de iniciar el panel administrativo.

<h2 id="configuracion">⚙️ Configuración</h2>

El proyecto incluye un único archivo de ejemplo, [.env.example](.env.example), con todas las variables necesarias para desarrollo y producción.

En desarrollo, cópialo a `.env.local`:

```bash
cp .env.example .env.local
```

En producción, cópialo a `.env`:

```bash
cp .env.example .env
```

Todas las variables que usa la aplicación se validan al iniciar mediante `src/config/env.ts` (Zod). Si falta alguna obligatoria o es inválida, la aplicación no arranca e indica exactamente qué configuración hay que corregir.

| Variable | Descripción |
|---|---|
| `APP_PORT` | Puerto en el que se inicia la aplicación. |
| `BASE_URL` | URL del backend Smart Option que usa el BFF para consumir la API. Nunca se expone al navegador. |
| `DOMAIN` *(producción)* | Dominio público del panel administrativo. Caddy lo usa para servir la aplicación y emitir certificados TLS automáticamente. |
| `ACME_EMAIL` *(producción)* | Correo electrónico usado por Let's Encrypt para las notificaciones del certificado TLS. |

> El panel **no** tiene una variable propia para el modo demostración. Quien decide es el backend (`APP_DEMO`) y el panel simplemente lo refleja — así ambos extremos nunca se contradicen. Ver [Modo Demostración](#modo-demo).

<h2 id="modo-demo">🎭 Modo Demostración</h2>

El panel administrativo incluye un **modo de demostración** pensado para presentaciones, casos de estudio y portafolio. Cuando el backend corre con `APP_DEMO=true`, la interfaz adapta su comportamiento automáticamente, permitiendo que cualquier visitante explore prácticamente todas las funcionalidades sin poner en riesgo el entorno.

No se requiere ninguna configuración adicional en el frontend: la detección del modo demostración es automática.

### 👤 Inicio de sesión como visitante

Cuando está disponible, la pantalla de autenticación muestra el botón **"Entrar como visitante"**, que da acceso al panel sin necesidad de credenciales públicas.

La sesión creada se comporta igual que una autenticación convencional, por lo que se puede recorrer el producto completo.

### 🛡️ Un entorno protegido

Para preservar la integridad de la demostración, las operaciones críticas siguen visibles pero no se pueden ejecutar. Así, el visitante conoce el flujo completo de la aplicación sin generar cambios irreversibles.

Entre las acciones protegidas están:

- Aprobación de solicitudes de retiro.
- Gestión del equipo administrativo.
- Gestión de roles y permisos.
- Cambio de los datos de la cuenta administrativa.
- Cambio de contraseña.

Siempre que una acción no esté disponible, la interfaz lo indica con claridad y explica el motivo.

> **Importante:** las restricciones que muestra el panel son únicamente de interfaz y experiencia de usuario. La protección efectiva ocurre en el backend, que sigue validando los permisos y rechazando las operaciones bloqueadas, incluso si la petición se envía directamente a la API.

<h2 id="pruebas">🧪 Pruebas</h2>

Ejecuta las pruebas con:

```bash
npm test                # Vitest (unitarias e integración)
npm run test:coverage   # reporte de cobertura
npm run test:e2e        # Playwright (end-to-end)
```

La suite está dividida en dos niveles:

- **Vitest + Testing Library**: cubre componentes, utilidades, validaciones, contratos con el backend e integraciones del BFF.
- **Playwright**: valida los flujos principales contra el backend real, incluyendo autenticación, dashboard, gestión de usuarios, solicitudes, equipo, roles, RBAC y configuración de la cuenta.

Para ejecutar la suite completa, el **Smart Option Backend** debe estar en ejecución (consulta el repositorio del backend).

> **Nota**
>
> El backend aplica rate limiting en la autenticación. Si se ejecutan muchas pruebas de login seguidas, puede aparecer una respuesta **429 (Too Many Requests)**. En ese caso, espera a que expire la ventana o elimina la clave correspondiente en el Redis del backend.

<h2 id="despliegue">🚀 Despliegue</h2>

El panel se puede desplegar de forma independiente del backend, en su propio VPS o compartiendo la misma infraestructura bajo otro dominio o subdominio.

La aplicación utiliza:

- **Docker** (build multi-stage)
- **Next.js standalone output**
- **Docker Compose**
- **Caddy** como reverse proxy, con emisión y renovación automática de certificados TLS (Let's Encrypt)

### Paso a paso

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

Caddy detecta el dominio configurado, emite el certificado TLS en la primera ejecución y se encarga de las renovaciones por su cuenta, sin configuración adicional de proxy ni Certbot.

Para seguir el arranque de la aplicación:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Para verificar la emisión del certificado:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

<h2 id="seguridad">🔒 Seguridad</h2>

El panel está construido en torno a la protección de la autenticación, el aislamiento entre cliente y backend y el control de acceso a las funcionalidades administrativas.

- **Autenticación:** el navegador nunca recibe ni manipula JWTs directamente. Toda la autenticación pasa por el BFF, que guarda los tokens exclusivamente en cookies `httpOnly`.
- **Comunicación con el backend:** todas las peticiones autenticadas pasan por los Route Handlers de Next.js, encargados de adjuntar los tokens y renovar la sesión cuando hace falta.
- **Control de acceso (RBAC):** la interfaz habilita u oculta acciones según los permisos del usuario, reflejando las reglas del backend. La autorización definitiva siempre la valida la API.
- **Protección de rutas:** `middleware.ts` impide el acceso a páginas autenticadas cuando no existe una sesión válida, evitando renderizados innecesarios.
- **Cabeceras de seguridad:** todas las respuestas incluyen políticas como Content Security Policy (CSP), HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
- **Gestión de configuración:** las URLs y demás ajustes provienen de variables de entorno, sin valores sensibles hardcodeados en el código fuente.

<h2 id="solucion-de-problemas">🛠️ Solución de problemas</h2>

### Backend inaccesible (`BACKEND_UNREACHABLE`)

Verifica que el **Smart Option Backend** esté en ejecución y que `BASE_URL` apunte a la URL correcta.

Cuando ambos proyectos corren en Docker, usa `host.docker.internal` para acceder al backend desde el contenedor del panel. Dentro del contenedor, `localhost` hace referencia al propio panel, no al backend.

### Puerto en uso (`EADDRINUSE`)

Otro proceso ya está usando el puerto definido en `APP_PORT`.

Al ejecutar el backend y el panel al mismo tiempo, usa puertos distintos (por defecto, **3000** para el backend y **3001** para el panel).

### Error 429 durante las pruebas

El backend aplica **rate limiting** en la autenticación. Ejecutar muchas pruebas de login seguidas puede agotar ese límite temporalmente.

Espera a que expire la ventana de tiempo o elimina la clave correspondiente en el Redis del backend (consulta la sección [Pruebas](#pruebas)).

### Los cambios no se reflejan en Docker

Si los cambios en el código no aparecen de inmediato, confirma que los volúmenes (*bind mounts*) estén configurados correctamente en `docker-compose.dev.yml`.

Después de modificar la configuración de Docker, recrea los contenedores:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

<h2 id="licencia">📄 Licencia</h2>

Este proyecto se distribuye bajo la **Smart Option Source Available License (SSAL)**.

Puedes:

- estudiar el código fuente;
- hacer un fork del repositorio con fines educativos;
- usar partes de la implementación como referencia de aprendizaje.

**No** puedes:

- usar este proyecto con fines comerciales;
- ofrecerlo como producto o servicio;
- crear plataformas de inversión, marketing multinivel (MLM), HYIP, esquemas Ponzi, pirámides financieras, apuestas o cualquier otro servicio financiero similar a partir de este código.

Consulta el archivo [LICENSE](LICENSE) para conocer los términos completos.

<h2 id="proyectos-relacionados">🔗 Proyectos relacionados</h2>

**Smart Option** fue desarrollado como un ecosistema de aplicaciones independientes, cada una con una responsabilidad específica. Dividirlo en varios repositorios aporta orden, facilita el desarrollo en paralelo y da como resultado una arquitectura más modular y escalable.

| Proyecto | Descripción | Repositorio |
|----------|-----------|-------------|
| 🌐 Landing Page | La landing page oficial de Smart Option, creada para presentar la plataforma, sus diferenciales y la experiencia que ofrece a los usuarios. | https://github.com/issagomesdev/smart-option-page |
| ⚙️ Backend (API + Bot) | La API y el bot de Telegram responsables de las reglas de negocio, autenticación, pagos, notificaciones e integraciones que consume el panel administrativo. | https://github.com/issagomesdev/smart-option |
