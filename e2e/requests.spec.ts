import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const STORAGE_STATE = path.join(__dirname, '.auth-state.requests.json')

/**
 * Cobertura E2E deliberadamente só de leitura/navegação — diferente do CRUD
 * de usuários, aprovar um saque de verdade aqui chamaria
 * `paymentService.createWithdrawalTransfer` contra a Asaas real (uma
 * transferência PIX de verdade, irreversível). O fluxo de autorizar/rejeitar
 * já é coberto por `WithdrawalsTable.test.tsx` com a action mockada; aqui só
 * confirmamos que as telas carregam dados reais e navegam sem erro.
 */
test.describe('Solicitações (App Router)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const response = await context.post('/api/auth/login', { data: { email: 'admin@admin.com', password: 'password' } })
    expect(response.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.use({ storageState: STORAGE_STATE })

  test('/requests carrega com as 4 abas e alterna entre elas sem erro', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('pageerror', error => consoleErrors.push(error.message))

    await page.goto('/requests')

    await expect(page.getByRole('heading', { name: 'Solicitações' })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Saques/ })).toBeVisible()

    await page.getByRole('tab', { name: 'Depósitos' }).click()
    await expect(page.getByRole('columnheader', { name: 'Situação' })).toBeVisible()

    await page.getByRole('tab', { name: /Suporte/ }).click()
    await expect(page.getByRole('columnheader', { name: 'Concluído' })).toBeVisible()

    await page.getByRole('tab', { name: 'Adesões' }).click()
    await expect(page.getByRole('columnheader', { name: 'Plano' })).toBeVisible()

    expect(consoleErrors).toEqual([])
  })

  test('/users/:id mostra as abas de Solicitações do usuário e alterna entre elas sem erro', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('pageerror', error => consoleErrors.push(error.message))

    // id 284 ("hayssa maria") não tem telegram_user_id — usuário de teste
    // seguro, já usado em outras partes desta fase.
    await page.goto('/users/284')

    await expect(page.getByText('Dados do usuário')).toBeVisible()

    const tabs = page.getByRole('tab')
    await expect(tabs).toHaveCount(6)

    await page.getByRole('tab', { name: 'Rede' }).click()
    await expect(page.getByRole('button', { name: /Afiliados/ })).toBeVisible()

    await page.getByRole('tab', { name: 'Saques' }).click()
    await expect(page.getByRole('columnheader', { name: 'Situação' })).toBeVisible()

    await page.getByRole('tab', { name: 'Extrato' }).click()
    await expect(page.getByText(/Saldo atual/)).toBeVisible()

    expect(consoleErrors).toEqual([])
  })
})
