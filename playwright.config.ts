import { defineConfig, devices } from '@playwright/test'

const PORT = 3001
const baseURL = `http://localhost:${PORT}`

// Testes de sistema (E2E) escritos a partir da Fase 6 do roadmap — este
// arquivo só prepara o tooling, ainda sem specs (`sem reescrever telas
// ainda`, Fase 1). `testDir` aponta para uma pasta que passa a existir
// quando os primeiros specs forem adicionados.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
