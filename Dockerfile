## Build multi-stage: builder compila com todas as devDependencies; a imagem
## final (runtime) só carrega o output "standalone" do Next.js (server.js +
## node_modules mínimo, já podado automaticamente pelo tracing do Next — sem
## precisar de um estágio de prune separado, diferente do backend). O
## estágio `dev` compartilha a instalação de dependências com `builder` mas
## nunca compila — o código-fonte entra via bind mount do
## docker-compose.dev.yml, para hot reload.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY tsconfig.json next.config.js next-env.d.ts middleware.ts ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM deps AS builder
COPY tsconfig.json next.config.js next-env.d.ts middleware.ts ./
COPY public ./public
COPY styles ./styles
COPY src ./src
# `BASE_URL` só é lido em runtime (Route Handlers/Server Components, sem
# prefixo NEXT_PUBLIC_ — nunca bundlado para o browser), mas `env.ts` valida
# (fail-fast) já na importação, e `next build` importa módulos do servidor
# durante a análise estática de rotas — precisa de um valor presente aqui
# nem que nunca seja usado de fato. O valor real vem do `.env` montado em
# runtime (ver docker-compose.dev.yml/docker-compose.prod.yml).
ENV BASE_URL=http://localhost:3000
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
# `server.js` (output "standalone") só escuta em todas as interfaces se
# HOSTNAME for setado explicitamente — sem isso, ele bind a um IP específico
# da rede do container (não 0.0.0.0 nem 127.0.0.1), e nem o HEALTHCHECK
# abaixo (que fala com 127.0.0.1) nem o `-p` do compose conseguem alcançá-lo
# de forma confiável. Achado real ao testar a imagem (Fase 7).
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Usuário não-root dedicado — a imagem base node:*-alpine já traz "node"
# (uid 1000), mas ele não é dono de /app por padrão.
RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# `server.js` (gerado pelo output "standalone") lê PORT/HOSTNAME do
# ambiente — compose traduz APP_PORT (convenção do projeto, igual ao
# backend) para PORT antes de subir o container.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
