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
  <a href="#modo-demo">Modo Demonstração</a> •
  <a href="#testes">Testes</a> •
  <a href="#deploy">Deploy</a> •
  <a href="#seguranca">Segurança</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#licenca">Licença</a> •
  <a href="#related-projects">Projetos Relacionados</a>
</p>

> ⚠️ **Aviso**: ambiente de demonstração/desenvolvimento. Não use credenciais reais de produção fora de um deploy controlado.

<h2 id="sobre">📌 Sobre</h2>

**Smart Option Admin** é o **painel administrativo** da plataforma **Smart Option**, desenvolvido para centralizar a operação e o gerenciamento da aplicação. Através dele, a equipe administrativa acompanha indicadores em tempo real, gerencia usuários, aprova solicitações financeiras, monitora a rede de afiliados, administra planos de investimento, acompanha movimentações auditadas e controla perfis de acesso e permissões, reunindo em um único ambiente todas as ferramentas necessárias para a gestão da plataforma.

Este repositório reúne o **frontend** do painel administrativo, desenvolvido com **Next.js (App Router)** e **Material UI**. A aplicação consome a **API REST** do **Smart Option Backend**, mantendo toda a lógica de negócio centralizada no servidor. A comunicação segue o padrão **Backend for Frontend (BFF)**: o navegador nunca acessa diretamente a API nem possui contato com os tokens de autenticação. Todas as requisições passam pelos **Route Handlers** do Next.js, que armazenam os tokens em **cookies HttpOnly**, adicionando uma camada extra de segurança e proporcionando uma arquitetura mais desacoplada, segura e escalável.

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

O painel centraliza os principais indicadores da plataforma em uma única visão operacional.

- Dashboard unificado inspirado em produtos como **Stripe**, **Linear** e **Vercel**, reunindo KPIs, gráficos e movimentações recentes em uma única consulta.
- Indicadores de **usuários ativos**, **saldo da rede**, **depósitos aprovados**, **saques pendentes** e **aprovações financeiras do dia**, com comparação em relação ao período anterior.
- Gráfico de evolução da rentabilidade da rede e tabela de movimentações recentes com acesso rápido ao histórico completo.
- Filtros por período (`Hoje`, `7 dias`, `30 dias` ou personalizado), além de recortes opcionais por usuário ou plano.
- Atualização reativa, *skeleton loading*, estados de erro e carregamento otimizados para uma experiência fluida.

---

### 🔍 Auditoria Financeira

Todas as movimentações financeiras da plataforma ficam centralizadas em uma única tela de auditoria.

- Histórico completo de depósitos, saques, rendimentos, comissões, adesões, ajustes administrativos e demais transações.
- Busca avançada com filtros combináveis por período, usuário, tipo, status, valores e pesquisa textual.
- Ordenação, paginação server-side e visualização detalhada de cada movimentação.
- Informações completas da operação, incluindo usuário, identificadores, gateway, administrador responsável, datas e observações.
- Exportação dos resultados filtrados.

---

### 📦 Gestão de Planos

Administração completa do catálogo de produtos da plataforma.

- Cadastro, edição, ativação, desativação e gerenciamento dos planos disponíveis.
- Busca, filtros, ordenação e paginação para facilitar a administração.
- Suporte aos modelos **AUTO** (compra imediata via PIX) e **MANUAL** (solicitação enviada para atendimento).
- Proteção dos planos padrão contra exclusão e alertas quando alterações impactam assinantes existentes.

---

### 👥 Gestão de Usuários

Gerenciamento completo dos usuários cadastrados na plataforma.

- Pesquisa, filtros e paginação server-side.
- Cadastro, edição, bloqueio e desbloqueio de contas.
- Consulta ao histórico financeiro, rede de afiliados e solicitações do usuário.
- Ajustes manuais de saldo totalmente auditados pelo backend.

---

### 💳 Gestão Financeira

Centralização das solicitações operacionais da plataforma.

- Aprovação ou rejeição de solicitações de saque.
- Acompanhamento de depósitos, adesões aos planos e atendimentos de suporte.
- Visualização da rede de afiliados com filtros e paginação.

---

### 🛡️ Administração

Ferramentas para gerenciamento do ambiente administrativo.

- Gerenciamento da equipe administrativa.
- Controle de papéis e permissões (**RBAC**).
- Configuração do perfil do administrador autenticado.
- Alteração de credenciais e preferências da conta.

---

### 🎭 Modo Demonstração

Modo especial desenvolvido para apresentação pública do projeto.

- Login como visitante sem necessidade de credenciais.
- Identificação visual discreta indicando o ambiente de demonstração.
- Bloqueio de operações irreversíveis diretamente no backend.
- Interface adaptada para informar quando determinada ação não está disponível no ambiente demo.

---

### 🔒 Segurança

Boas práticas aplicadas em toda a aplicação.

- Arquitetura **Backend for Frontend (BFF)** utilizando **Next.js Route Handlers**.
- Tokens armazenados exclusivamente em **cookies HttpOnly**.
- Controle de permissões integrado ao backend.
- Proteção por **Content Security Policy (CSP)**, cabeçalhos de segurança e validações em todas as operações críticas.

<h2 id="stack">🛠️ Stack</h2>

| Categoria | Tecnologias |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript 5 |
| **Interface** | [Material UI (MUI)](https://mui.com/), Emotion |
| **Gerenciamento de Estado** | React Context API |
| **Formulários** | React Hook Form + [Zod](https://zod.dev/) (`@hookform/resolvers`) |
| **Validação** | Zod (formulários, contratos da API e variáveis de ambiente) |
| **Comunicação com API** | Fetch API, BFF (Backend for Frontend), Route Handlers do Next.js |
| **Autenticação** | Cookies `HttpOnly`, Access Token, Refresh Token e renovação automática de sessão |
| **Qualidade** | ESLint, Prettier e TypeScript Strict Mode |
| **Testes** | [Vitest](https://vitest.dev/) + Testing Library (unitários e integração), [Playwright](https://playwright.dev/) (E2E) |
| **Infraestrutura** | Docker multi-stage (`output: standalone`), Docker Compose e [Caddy](https://caddyserver.com/) (TLS automático via Let's Encrypt) |

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

O painel administrativo é organizado por módulos, cada um dedicado a uma área específica da operação da plataforma. Abaixo estão as principais rotas da aplicação.

### 🔐 Autenticação

Gerenciamento do acesso ao painel administrativo.

| Rota | Descrição |
|---|---|
| `/login` | Autenticação da equipe administrativa e acesso ao painel. |

---

### 📊 Dashboard

Central de monitoramento da plataforma.

| Rota | Descrição |
|---|---|
| `/` | Dashboard principal com KPIs, indicadores financeiros, gráfico de rentabilidade da rede e movimentações recentes, incluindo filtros por período, usuário e plano. |

---

### 🔍 Auditoria Financeira

Consulta e rastreamento das movimentações financeiras.

| Rota | Descrição |
|---|---|
| `/audit` | Histórico completo de movimentações financeiras, com filtros avançados, ordenação, detalhes da operação e exportação dos resultados. |

---

### 👥 Gestão de Usuários

Administração dos usuários cadastrados na plataforma.

| Rota | Descrição |
|---|---|
| `/users` | Listagem, pesquisa e filtros de usuários. |
| `/users/create` | Cadastro de novos usuários. |
| `/users/[id]` | Perfil completo do usuário, incluindo extrato, rede de afiliados e solicitações. |
| `/users/[id]/edit` | Edição das informações do usuário. |
| `/users/view/[view]` | Visualizações auxiliares relacionadas ao gerenciamento de usuários. |

---

### 💳 Gestão Financeira

Operação das solicitações financeiras da plataforma.

| Rota | Descrição |
|---|---|
| `/requests` | Gerenciamento de depósitos, saques, adesões a planos, atendimentos de suporte e acompanhamento da rede de afiliados. |

---

### 📦 Gestão de Planos

Administração do catálogo de produtos da plataforma.

| Rota | Descrição |
|---|---|
| `/plans` | Listagem dos planos com busca, filtros, ordenação e exportação. |
| `/plans/create` | Cadastro de novos planos. |
| `/plans/[id]/edit` | Edição das informações de um plano existente. |

---

### 🛡️ Administração

Gerenciamento da equipe administrativa e das permissões de acesso.

| Rota | Descrição |
|---|---|
| `/team` | Listagem e gerenciamento da equipe administrativa. |
| `/team/create` | Cadastro de novos colaboradores. |
| `/team/[id]/edit` | Edição de colaboradores. |
| `/team/roles` | Gerenciamento de papéis e permissões (RBAC). |
| `/team/roles/create` | Cadastro de novos papéis. |
| `/team/roles/[id]/edit` | Edição de papéis e permissões. |
| `/account-settings` | Configuração da conta do administrador autenticado, incluindo dados pessoais e alteração de senha. |

---

### 🎨 Design System

Ambiente dedicado ao desenvolvimento e validação dos componentes da interface.

| Rota | Descrição |
|---|---|
| `/design-system` | Catálogo dos componentes reutilizáveis, tokens visuais e demonstrações utilizadas durante o desenvolvimento da interface. |

---

### 🌐 API (BFF)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Realiza o login e cria a sessão (`HttpOnly`). |
| POST | `/api/auth/demo-login` | Cria uma sessão de visitante, sem credenciais. Responde 404 quando o backend não está em modo demonstração. |
| POST | `/api/auth/refresh` | Renova os tokens de autenticação. |
| POST | `/api/auth/logout` | Encerra a sessão e remove os cookies. |
| GET | `/api/auth/me` | Retorna o usuário autenticado. |
| GET | `/api/health` | Endpoint de saúde utilizado pelo Docker. |

<h2 id="comecando">▶️ Começando (desenvolvimento local)</h2>

### Pré-requisitos

- Node.js 24+ (necessário apenas para execução fora do Docker)
- Docker + Docker Compose
- Backend **Smart Option** em execução (API + Bot)

### Via Docker (recomendado)

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

### Sem Docker

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

### Scripts disponíveis

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

### Primeiro acesso

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

> O painel **não** tem variável própria para o modo demonstração. Quem decide é o backend (`APP_DEMO`), e o painel apenas reflete — assim as duas pontas nunca divergem. Ver [Modo Demonstração](#modo-demo).

<h2 id="modo-demo">🎭 Modo Demonstração</h2>

O painel administrativo oferece um **modo de demonstração** pensado para apresentações, estudos de caso e portfólio. Quando o backend está com `APP_DEMO=true`, a interface adapta automaticamente seu comportamento, permitindo que qualquer visitante explore praticamente todas as funcionalidades da aplicação sem comprometer a integridade do ambiente.

Nenhuma configuração adicional é necessária no frontend: toda a detecção do modo demonstração acontece automaticamente.

### 👤 Login de visitante

Quando disponível, a tela de autenticação exibe o botão **"Entrar como visitante"**, permitindo acessar o painel sem a necessidade de credenciais públicas.

A sessão criada possui o mesmo comportamento de uma autenticação convencional, proporcionando uma experiência completa de navegação por todo o sistema.

### 🛡️ Ambiente protegido

Para preservar a integridade da demonstração, operações críticas permanecem visíveis, porém indisponíveis para execução. Dessa forma, o visitante consegue conhecer o fluxo completo da aplicação sem gerar alterações irreversíveis.

Entre as ações protegidas estão:

- Aprovação de solicitações de saque.
- Gerenciamento da equipe administrativa.
- Gerenciamento de papéis e permissões.
- Alteração dos dados da conta administrativa.
- Alteração de senha.

Sempre que uma ação estiver indisponível, a interface informa claramente o motivo, proporcionando uma experiência transparente ao usuário.

> **Importante:** as restrições exibidas pelo painel têm apenas finalidade visual e de experiência do usuário. A proteção efetiva acontece no backend, que continua validando todas as permissões e recusando operações bloqueadas, mesmo que uma requisição seja enviada diretamente para a API.

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

### Passo a passo

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

O **Smart Option** foi desenvolvido como um ecossistema composto por aplicações independentes, cada uma dedicada a uma responsabilidade específica. A divisão em múltiplos repositórios proporciona maior organização, facilita o desenvolvimento paralelo e torna a arquitetura mais modular e escalável.

| Projeto | Descrição | Repositório |
|----------|-----------|-------------|
| 🌐 Landing Page | Landing page oficial do Smart Option, desenvolvida para apresentar a plataforma, seus diferenciais e a experiência proposta aos usuários. | https://github.com/issagomesdev/smart-option-page |
| ⚙️ Backend (API + Bot) | API e bot do Telegram responsáveis pelas regras de negócio, autenticação, pagamentos, notificações e integrações usadas pelo painel administrativo. | https://github.com/issagomesdev/smart-option |
