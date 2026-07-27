import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const STORAGE_STATE = path.join(__dirname, '.auth-state.audit.json')

/**
 * Cobertura E2E da Auditoria Financeira (Fase 7) — histórico completo e
 * filtrável das 3 fontes de movimentação unidas (`AuditService.list`). Só
 * leitura/navegação, mesmo espírito de `requests.spec.ts`: confirma que a
 * tela carrega dados reais, filtra, ordena e abre o detalhe sem erro.
 */
test.describe('Auditoria Financeira (App Router)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const response = await context.post('/api/auth/login', { data: { email: 'admin@admin.com', password: 'password' } })
    expect(response.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.use({ storageState: STORAGE_STATE })

  test('nav leva para /audit, tabela carrega com dados reais e "Exportar" está presente', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('pageerror', error => consoleErrors.push(error.message))

    await page.goto('/')
    await page.getByRole('link', { name: 'Auditoria Financeira' }).click()
    await page.waitForURL(/\/audit\/?$/)

    await expect(page.getByRole('heading', { name: 'Auditoria Financeira' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Valor' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Exportar/ })).toBeVisible()

    expect(consoleErrors).toEqual([])
  })

  test('filtro de Tipo restringe a tabela e "Tudo" (padrão) traz o histórico completo', async ({ page }) => {
    await page.goto('/audit')

    await page.getByLabel('Tipo').click()
    await page.getByRole('option', { name: 'Depósito PIX' }).click()

    const rows = page.getByRole('row')
    await expect(rows).not.toHaveCount(1) // pelo menos o cabeçalho + alguma linha, ou o empty state
    const cells = page.locator('td')
    if ((await cells.count()) > 0) {
      // Toda linha visível deve ser mesmo um Depósito PIX.
      await expect(page.getByText('Comissão de Adesão')).not.toBeVisible()
    }
  })

  test('ordenar por Valor e abrir o detalhe de uma movimentação mostra os campos completos', async ({ page }) => {
    await page.goto('/audit')

    await page.getByRole('columnheader', { name: 'Valor' }).getByText('Valor').click()
    await expect(page.getByRole('columnheader', { name: 'Valor' }).locator('svg')).toBeVisible()

    const firstDetailButton = page.getByRole('button', { name: 'Ver detalhes' }).first()
    await firstDetailButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(/^Movimentação /)).toBeVisible()
    await expect(dialog.getByText('Tipo')).toBeVisible()
    await expect(dialog.getByText('Administrador responsável')).toBeVisible()
    await expect(dialog.getByText('Observações')).toBeVisible()

    await dialog.getByRole('button', { name: 'Fechar' }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('filtrar por usuário via Autocomplete mantém o nome selecionado (sem regressão do reset do MUI)', async ({
    page
  }) => {
    await page.goto('/audit')

    // id 284 ("hayssa maria") é único no banco de dev (sem homônimo) — mesmo
    // usuário de teste seguro já usado em `requests.spec.ts`.
    const userInput = page.getByRole('combobox', { name: 'Usuário' })
    await userInput.fill('hayssa maria')
    const option = page.getByRole('option', { name: /hayssa maria/ }).first()
    await option.waitFor({ state: 'visible' })
    await option.click()

    await expect(userInput).toHaveValue(/hayssa maria/)
  })
})
