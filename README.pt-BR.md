<p align="center">
  <a href="./README.md">🇺🇸 English</a> |
  <b>🇧🇷 Português</b> |
  <a href="./README.es.md">🇪🇸 Español</a>
</p>

# 📊 Smart Option — Painel Administrativo

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-9.x-007FFF?style=for-the-badge&logo=mui&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <a href="#sobre">Sobre</a> •
  <a href="#arquitetura">Arquitetura</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#stack">Stack</a> •
  <a href="#estrutura">Estrutura</a> •
  <a href="#rotas">Rotas</a> •
  <a href="#comecando">Começando</a> •
  <a href="#ambientes">Configuração de Ambientes</a> •
  <a href="#testes">Testes</a> •
  <a href="#deploy">Deploy</a> •
  <a href="#seguranca">Segurança</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#licenca">Licença</a> •
  <a href="#related-projects">Projetos Relacionados</a>
</p>

> ⚠️ **Aviso**: ambiente de demonstração/desenvolvimento. Não use credenciais reais de produção fora de um deploy controlado.

<h2 id="sobre">📌 Sobre</h2>

**Smart Option Admin** é o painel administrativo da plataforma **Smart Option**, responsável pelo gerenciamento operacional da aplicação. Por meio dele, a equipe administrativa gerencia usuários, aprova solicitações financeiras, acompanha a rede de afiliados, monitora indicadores e administra perfis de acesso e permissões.

Desenvolvido com **Next.js (App Router)** e **Material UI**, o painel consome a API do **Smart Option Backend**, mantendo toda a lógica de negócio centralizada no backend.

A comunicação com a API segue o padrão **BFF (Backend for Frontend)**: o navegador nunca se comunica diretamente com o backend nem tem acesso aos tokens de autenticação. Todas as requisições passam pelos **Route Handlers** do Next.js, que armazenam os tokens em cookies `HttpOnly`, adicionando uma camada extra de segurança.

<h2 id="arquitetura">🏗️ Arquitetura</h2>

Estrutura organizada por responsabilidades, separando domínio, infraestrutura, interface e componentes reutilizáveis.

```text
config/          → configuração da aplicação e validação do ambiente
domain/          → contratos da API, DTOs, permissões e regras compartilhadas
infrastructure/  → comunicação com o backend, gerenciamento de sessão e serviços
components/      → Design System e componentes reutilizáveis da interface
app/             → páginas, layouts, Route Handlers (BFF) e Server Actions
```

### Princípios arquiteturais

- **Autenticação via BFF:** o navegador nunca acessa o backend diretamente nem manipula tokens JWT. Todo o fluxo de autenticação passa pelos Route Handlers do Next.js, que armazenam os tokens em cookies `HttpOnly`.

- **Cliente HTTP centralizado:** toda comunicação com o backend passa pelo `backend-client`, responsável por autenticação, tratamento de erros e padronização das requisições.

- **RBAC integrado ao backend:** as permissões controlam a experiência da interface (menus, botões e ações disponíveis), enquanto a validação definitiva permanece no backend.

- **Componentes reutilizáveis:** tabelas, formulários, diálogos, indicadores de status e demais elementos visuais seguem um Design System próprio, mantendo consistência e reduzindo duplicação.

- **Renderização otimizada:** uso de Server Components, Server Actions e App Router para reduzir o JavaScript enviado ao navegador e melhorar a performance da aplicação.

<h2 id="funcionalidades">✨ Funcionalidades</h2>

### 📊 Dashboard

- Métricas em tempo real da plataforma (usuários, saldo e planos).
- Filtros por período para acompanhamento dos indicadores.

### 👥 Gestão de usuários

- Listagem, pesquisa e filtros server-side.
- Cadastro, edição e visualização de usuários.
- Histórico de extratos, saques e rede de afiliados.
- Bloqueio e desbloqueio de contas.
- Ajuste manual de saldo (auditado pelo backend).

### 💳 Gestão de solicitações

- Aprovação e rejeição de saques.
- Acompanhamento de depósitos, adesões e solicitações de suporte.
- Rede de afiliados e solicitações com paginação e filtros server-side.

### 🛡️ Administração

- Gerenciamento da equipe administrativa.
- CRUD de papéis e permissões (RBAC).
- Configuração dos dados da conta do usuário autenticado.
- Alteração de senha.

### 🔒 Segurança

- Autenticação protegida por BFF e cookies `HttpOnly`.
- Controle de permissões integrado ao backend.
- Content Security Policy (CSP) e demais cabeçalhos de segurança configurados pelo Next.js.

<h2 id="stack">🛠️ Stack</h2>

| Categoria | Tecnologias |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript 5 |
| Interface | [Material UI (MUI)](https://mui.com/) 9, Emotion |
| Formulários | React Hook Form + Zod (`@hookform/resolvers`) |
| Validação | [Zod](https://zod.dev/) (DTOs, contratos da API e variáveis de ambiente) |
| Autenticação | BFF (Backend for Frontend), cookies `HttpOnly` e Server Actions |
| Testes | [Vitest](https://vitest.dev/) + Testing Library (unitários e integração), [Playwright](https://playwright.dev/) (E2E) |
| Deploy | Docker multi-stage (`output: standalone`), Docker Compose e [Caddy](https://caddyserver.com/) (TLS automático via Let's Encrypt) |

<h2 id="estrutura">📁 Estrutura</h2>

```text
src/
├─ config/                  # configuração da aplicação e validação do ambiente
├─ domain/                  # DTOs, contratos da API, permissões e constantes compartilhadas
├─ infrastructure/          # comunicação com o backend, sessão, cookies e clients HTTP
├─ components/              # Design System, componentes reutilizáveis e layout da aplicação
├─ theme/                   # tema, tipografia, cores e tokens de design
└─ app/                     # App Router (páginas, layouts, Route Handlers e Server Actions)
   ├─ api/                  # camada BFF responsável pela autenticação e integração com o backend
   ├─ login/                # autenticação
   ├─ design-system/        # catálogo dos componentes reutilizáveis
   └─ (dashboard)/          # área autenticada da aplicação

middleware.ts               # proteção de rotas e validação inicial da sessão
e2e/                        # testes end-to-end (Playwright)
public/                     # arquivos estáticos
Caddyfile                   # configuração do Caddy para produção
```

<h2 id="rotas">📍 Rotas</h2>

### 🔐 Autenticação

| Rota | Descrição |
|---|---|
| `/login` | Autenticação da equipe administrativa |

### 📊 Dashboard

| Rota | Descrição |
|---|---|
| `/` | Dashboard com métricas e filtros por período |

### 👥 Usuários

| Rota | Descrição |
|---|---|
| `/users` | Listagem e pesquisa de usuários |
| `/users/create` | Cadastro de usuário |
| `/users/[id]/edit` | Edição de usuário |
| `/users/[id]` | Perfil do usuário (extrato, rede e solicitações) |
| `/users/view/[view]` | Visualizações auxiliares |

### 💳 Solicitações

| Rota | Descrição |
|---|---|
| `/requests` | Depósitos, saques, adesões, suporte e rede de afiliados |

### 🛡️ Administração

| Rota | Descrição |
|---|---|
| `/team` | Gerenciamento da equipe |
| `/team/create` | Cadastro de colaborador |
| `/team/[id]/edit` | Edição de colaborador |
| `/team/roles` | Papéis e permissões |
| `/team/roles/create` | Cadastro de papel |
| `/team/roles/[id]/edit` | Edição de papel |
| `/account-settings` | Dados pessoais e alteração de senha |

### 🎨 Desenvolvimento

| Rota | Descrição |
|---|---|
| `/design-system` | Catálogo e preview dos componentes do Design System |

---

### 🌐 API (BFF)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Realiza o login e cria a sessão (`HttpOnly`). |
| POST | `/api/auth/refresh` | Renova os tokens de autenticação. |
| POST | `/api/auth/logout` | Encerra a sessão e remove os cookies. |
| GET | `/api/auth/me` | Retorna o usuário autenticado. |
| GET | `/api/health` | Endpoint de saúde utilizado pelo Docker. |

<h2 id="comecando">▶️ Começando (desenvolvimento local)</h2>

### Pré-requisitos

- Node.js 24+ (necessário apenas para execução fora do Docker)
- Docker + Docker Compose
- Backend **Smart Option** em execução (API + Bot)

## Via Docker (recomendado)

```bash
git clone <url-do-repositorio> smart-option-admin
cd smart-option-admin

cp .env.example .env.local
```

Se necessário, ajuste a URL do backend no `.env.local`.

Em seguida:

```bash
docker compose -f docker-compose.dev.yml up -d
```

A aplicação ficará disponível em:

```
http://localhost:<APP_PORT>
```

O ambiente usa **Hot Reload** via bind mount, refletindo alterações em `src/` sem necessidade de rebuild da imagem.

## Sem Docker

```bash
git clone <url-do-repositorio> smart-option-admin
cd smart-option-admin

npm install

cp .env.example .env.local

npm run dev
```

A aplicação ficará disponível em:

```
http://localhost:<APP_PORT>
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento com hot reload (Next.js + Turbopack) |
| `npm run build` | Gera a versão otimizada para produção |
| `npm start` | Inicia a aplicação em modo produção |
| `npm run typecheck` | Executa a verificação de tipos do TypeScript |
| `npm run lint` / `npm run lint:fix` | Analisa e corrige problemas de lint com ESLint |
| `npm run format` | Formata o código com Prettier |
| `npm test` | Executa a suíte de testes (Vitest) |
| `npm run test:watch` | Executa os testes em modo observação |
| `npm run test:coverage` | Gera o relatório de cobertura dos testes |
| `npm run test:e2e` | Executa os testes end-to-end com Playwright |

## Primeiro acesso

Após iniciar o frontend, faça login com o usuário administrador criado pelo seed do backend:

| Campo | Valor |
|---|---|
| E-mail | `admin@admin.com` |
| Senha | `password` |

> O backend deve estar em execução antes de iniciar o painel administrativo.

<h2 id="ambientes">⚙️ Configuração de Ambientes</h2>

O projeto usa um único arquivo de exemplo, [.env.example](.env.example), com todas as variáveis necessárias para desenvolvimento e produção.

Em desenvolvimento, copie para `.env.local`:

```bash
cp .env.example .env.local
```

Em produção, copie para `.env`:

```bash
cp .env.example .env
```

Todas as variáveis usadas pela aplicação são validadas na inicialização por `src/config/env.ts` (Zod). Se alguma obrigatória estiver ausente ou inválida, a aplicação não inicia e informa exatamente qual configuração precisa ser corrigida.

| Variável | Descrição |
|---|---|
| `APP_PORT` | Porta onde a aplicação será iniciada. |
| `BASE_URL` | URL do backend Smart Option usada pelo BFF para consumir a API. Nunca é exposta ao navegador. |
| `DOMAIN` *(produção)* | Domínio público do painel administrativo. Usado pelo Caddy para servir a aplicação e emitir certificados TLS automaticamente. |
| `ACME_EMAIL` *(produção)* | E-mail usado pelo Let's Encrypt para notificações relacionadas ao certificado TLS. |

<h2 id="testes">🧪 Testes</h2>

Execute os testes com:

```bash
npm test                # Vitest (unitários e integração)
npm run test:coverage   # relatório de cobertura
npm run test:e2e        # Playwright (end-to-end)
```

A suíte é dividida em dois níveis:

- **Vitest + Testing Library**: cobre componentes, utilitários, validações, contratos com o backend e integrações do BFF.
- **Playwright**: valida os principais fluxos da aplicação contra o backend real, incluindo autenticação, dashboard, gerenciamento de usuários, solicitações, equipe, papéis, RBAC e configurações da conta.

Para executar toda a suíte, o **Smart Option Backend** precisa estar em execução (consulte o repositório do backend).

> **Observação**
>
> O backend aplica rate limiting na autenticação. Se muitos testes de login forem executados em sequência, uma resposta **429 (Too Many Requests)** pode ocorrer. Nesse caso, aguarde a janela expirar ou limpe a chave correspondente no Redis do backend.

<h2 id="deploy">🚀 Deploy</h2>

O painel pode ser implantado de forma independente do backend, usando uma VPS própria ou compartilhando a mesma infraestrutura em outro domínio ou subdomínio.

A aplicação usa:

- **Docker** (multi-stage build)
- **Next.js Standalone Output**
- **Docker Compose**
- **Caddy** como reverse proxy, com emissão e renovação automática de certificados TLS (Let's Encrypt)

### Deploy

```bash
cp .env.example .env
```

Configure as variáveis de produção:

- `APP_PORT`
- `BASE_URL` (URL pública do Smart Option Backend)
- `DOMAIN`
- `ACME_EMAIL`

Em seguida, execute:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

O Caddy detecta automaticamente o domínio configurado, emite o certificado TLS na primeira execução e cuida das renovações sozinho, sem configuração adicional de proxy ou Certbot.

Para acompanhar a inicialização da aplicação:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Para verificar a emissão do certificado:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

<h2 id="seguranca">🔒 Segurança</h2>

O painel adota práticas voltadas para proteção da autenticação, isolamento entre cliente e backend e controle de acesso às funcionalidades administrativas.

- **Autenticação:** o navegador nunca recebe ou manipula JWTs diretamente. Toda autenticação é feita pelo BFF, que armazena os tokens exclusivamente em cookies `httpOnly`.
- **Comunicação com o backend:** todas as requisições autenticadas passam pelos Route Handlers do Next.js, responsáveis por anexar os tokens e renovar a sessão quando necessário.
- **Controle de acesso (RBAC):** a interface habilita ou oculta ações conforme as permissões do usuário, refletindo as regras do backend. A autorização definitiva continua sendo validada pela API.
- **Proteção de rotas:** o `middleware.ts` impede o acesso a páginas autenticadas quando não existe uma sessão válida, evitando renderizações desnecessárias.
- **Cabeçalhos de segurança:** todas as respostas incluem políticas como Content Security Policy (CSP), HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.
- **Gerenciamento de configuração:** URLs e demais configurações vêm de variáveis de ambiente, sem valores sensíveis hardcoded no código-fonte.

<h2 id="troubleshooting">🛠️ Troubleshooting</h2>

### Backend indisponível (`BACKEND_UNREACHABLE`)

Verifique se o **Smart Option Backend** está em execução e se `BASE_URL` aponta para a URL correta.

Quando os dois projetos estiverem rodando via Docker, use `host.docker.internal` para acessar o backend a partir do container do painel. Dentro do container, `localhost` referencia o próprio painel, não o backend.

### Porta já em uso (`EADDRINUSE`)

Outro processo já está usando a porta definida em `APP_PORT`.

Ao rodar backend e painel simultaneamente, use portas diferentes (por padrão, **3000** para o backend e **3001** para o painel).

### Erro 429 durante os testes

O backend aplica **rate limiting** na autenticação. Rodar muitos testes de login em sequência pode esgotar esse limite temporariamente.

Aguarde a janela de tempo expirar ou limpe a chave correspondente no Redis do backend (consulte a seção [Testes](#testes)).

### Alterações não refletem no Docker

Se mudanças no código não aparecerem imediatamente, confirme que os volumes (*bind mounts*) estão configurados corretamente no `docker-compose.dev.yml`.

Depois de alterar a configuração do Docker, recrie os containers:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

<h2 id="licenca">📄 Licença</h2>

Este projeto é distribuído sob a **Smart Option Source Available License (SSAL)**.

Você pode:

- estudar o código-fonte;
- fazer um fork do repositório para fins educacionais;
- utilizar trechos da implementação como referência de aprendizado.

Você **não pode**:

- utilizar este projeto para fins comerciais;
- disponibilizá-lo como um produto ou serviço;
- criar plataformas de investimento, marketing multinível (MLM), HYIP, esquemas Ponzi, pirâmides financeiras, apostas ou qualquer outro serviço financeiro semelhante utilizando este código.

Consulte o arquivo [LICENSE](LICENSE) para os termos completos da licença.

<h2 id="related-projects">🔗 Projetos Relacionados</h2>

| Projeto | Descrição | Repositório |
|----------|-----------|-------------|
| ⚙️ Backend (API + Bot) | API e bot do Telegram responsáveis pelas regras de negócio, autenticação, pagamentos, notificações e integrações usadas pelo painel administrativo. | https://github.com/issagomesdev/smart-option |
