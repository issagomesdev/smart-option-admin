import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    // Os 5s padrão do Vitest não bastam aqui: `userEvent.type` digita caractere a caractere, e um
    // formulário com vários campos gasta segundos só nisso. Com os workers competindo por CPU, os
    // testes de formulário estouravam o limite de forma intermitente — o conjunto que falhava
    // mudava a cada execução, e todos passavam quando rodados isoladamente. É o mesmo ajuste que o
    // backend já faz (lá por causa das idas ao banco), pela mesma razão: o limite media contenção
    // de máquina, não lentidão do código.
    testTimeout: 20000,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    env: {
      // `env.ts` valida na importação (fail-fast) — precisa de um valor
      // presente para os módulos que o importam não quebrarem só de carregar.
      // Usa o valor já presente em `process.env` quando existir (achado real
      // da Fase 7, mesmo padrão do backend/Fase 24 dele: dentro do container
      // de dev, `docker-compose.dev.yml` injeta
      // BASE_URL=http://host.docker.internal:3000 — de dentro do container,
      // "localhost:3000" não é o backend). Fora do Docker (`npm test` direto
      // no host), cai no fallback "localhost", onde o
      // `docker-compose.dev.yml` do backend expõe a porta.
      BASE_URL: process.env.BASE_URL ?? 'http://localhost:3000'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}']
    }
  }
})
