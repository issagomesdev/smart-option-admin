import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const STORAGE_STATE = path.join(__dirname, '.auth-state.account-settings.json')

/**
 * Cobertura E2E deliberadamente só de leitura/navegação — mais cautelosa
 * ainda que `requests.spec.ts`: `admin@admin.com`/`password` é a credencial
 * compartilhada por TODOS os specs deste projeto (`auth`, `dashboard`,
 * `users`, `requests`). Submeter de verdade o formulário de senha aqui
 * trocaria a senha usada por toda a suíte — se o teste falhar no meio do
 * caminho antes de restaurar, todo o resto da suíte (presente e futura)
 * perde acesso. O fluxo de submit/sucesso/erro já está coberto por
 * `AccountForm.test.tsx`/`SecurityForm.test.tsx` com as actions mockadas;
 * aqui só confirmamos que a tela carrega os dados reais da sessão e navega
 * sem erro.
 */
test.describe('Configurações da conta (App Router)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const response = await context.post('/api/auth/login', { data: { email: 'admin@admin.com', password: 'password' } })
    expect(response.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.use({ storageState: STORAGE_STATE })

  test('/account-settings carrega os dados reais da sessão e alterna entre as abas sem erro', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('pageerror', error => consoleErrors.push(error.message))

    await page.goto('/account-settings')

    await expect(page.getByRole('tab', { name: 'Conta' })).toBeVisible()
    await expect(page.getByLabel('E-mail')).toHaveValue('admin@admin.com')

    await page.getByRole('tab', { name: 'Segurança' }).click()
    await expect(page.getByLabel('Senha atual')).toBeVisible()
    await expect(page.getByLabel('Nova senha', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Repetir nova senha')).toBeVisible()

    expect(consoleErrors).toEqual([])
  })

  test('link "Configurações da conta" no menu do usuário navega para /account-settings', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Menu do usuário' }).click()
    await page.getByRole('menuitem', { name: 'Configurações da conta' }).click()

    await expect(page).toHaveURL(/\/account-settings\/?$/)
    await expect(page.getByRole('tab', { name: 'Conta' })).toBeVisible()
  })
})
