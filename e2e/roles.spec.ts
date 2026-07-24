import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const STORAGE_STATE = path.join(__dirname, '.auth-state.roles.json')

test.describe('Papéis (CRUD, App Router)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const response = await context.post('/api/auth/login', { data: { email: 'admin@admin.com', password: 'password' } })
    expect(response.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.use({ storageState: STORAGE_STATE })

  test('lista carrega com os papéis semeados e "Gerenciar papéis" aparece em /team', async ({ page }) => {
    await page.goto('/team')
    await expect(page.getByRole('link', { name: /Gerenciar papéis/ })).toBeVisible()

    await page.goto('/team/roles')
    await expect(page.getByRole('heading', { name: 'Papéis' })).toBeVisible()
    await expect(page.getByRole('row', { name: /^admin/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /^staff/ })).toBeVisible()
  })

  test('fluxo completo: criar papel → editar permissões → excluir', async ({ page }) => {
    const uniqueName = `e2e-role-${Date.now()}`

    await page.goto('/team/roles/create')
    await page.getByLabel('Nome').fill(uniqueName)
    await page.getByLabel('Descrição (opcional)').fill('Papel de teste E2E')
    await page.getByRole('checkbox', { name: /Marcar solicitações de suporte/ }).check()
    await page.getByRole('button', { name: 'Cadastrar' }).click()

    await page.waitForURL(/\/team\/roles\/?$/)
    const row = page.getByRole('row', { name: new RegExp(uniqueName) })
    await expect(row).toBeVisible()
    await expect(row.getByText('Marcar solicitações de suporte como concluídas')).toBeVisible()

    // Editar — adiciona uma segunda permissão.
    await row.getByRole('link', { name: `Editar papel ${uniqueName}` }).click()
    await page.waitForURL(/\/team\/roles\/\d+\/edit\/?$/)
    await expect(page.getByRole('checkbox', { name: /Marcar solicitações de suporte/ })).toBeChecked()
    await page.getByRole('checkbox', { name: /Ajustar saldo manualmente/ }).check()
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    await page.waitForURL(/\/team\/roles\/?$/)
    const rowAfterEdit = page.getByRole('row', { name: new RegExp(uniqueName) })
    await expect(rowAfterEdit.getByText('Ajustar saldo manualmente')).toBeVisible()

    // Excluir — passa pelo ConfirmDialog.
    await rowAfterEdit.getByRole('button', { name: `Excluir papel ${uniqueName}` }).click()
    await expect(page.getByText('Excluir papel?')).toBeVisible()
    await page.getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Papel excluído com sucesso')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('row', { name: new RegExp(uniqueName) })).not.toBeVisible()
  })

  test('não permite excluir um papel de sistema (admin/staff) — ação nem aparece', async ({ page }) => {
    await page.goto('/team/roles')

    const adminRow = page.getByRole('row', { name: /^admin/ })
    await expect(adminRow.getByRole('link', { name: 'Editar papel admin' })).toBeVisible()
    await expect(adminRow.getByRole('button', { name: 'Excluir papel admin' })).not.toBeVisible()
  })
})
