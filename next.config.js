/**
 * CSP sem nonce por requisição de propósito: gerar um nonce de verdade exige
 * mover a política para `middleware.ts` (só `headers()` estático é possível
 * aqui) e threadear o valor pelos scripts inline que o próprio Next injeta
 * na hidratação — escopo maior do que o pedido nesta parte da Fase 5 para um
 * painel interno, autenticado, sem conteúdo de terceiro embutido. Por isso
 * `script-src`/`style-src` precisam de `'unsafe-inline'` (hidratação do
 * Next e `@emotion`/MUI, que injeta `<style>` em runtime) — o valor real
 * desta política está em `frame-ancestors`/`object-src`/`connect-src`
 * restritos a `'self'`, que bloqueiam clickjacking, plugins e exfiltração
 * para domínio de terceiro mesmo que um script malicioso seja injetado.
 */
// `unsafe-eval` só em dev: o React em modo desenvolvimento usa `eval()` para
// reconstruir stack traces entre módulos (fast refresh/HMR) — "React will
// never use eval() in production mode" é literal, confirmado ao vivo (sem
// isso, `next dev` quebra com "eval() is not supported"; `next build` +
// `next start` nunca precisam disso).
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV !== 'production' ? ["'unsafe-eval'"] : [])
].join(' ')

const CSP = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'"
].join('; ')

/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  // Build enxuta para Docker (Fase 7): `.next/standalone` traz só os
  // arquivos/deps que o `server.js` de produção realmente usa, em vez de
  // exigir `node_modules` inteiro (com devDependencies) na imagem final.
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ]
  }
}
