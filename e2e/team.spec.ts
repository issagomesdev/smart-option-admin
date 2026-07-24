import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const STORAGE_STATE = path.join(__dirname, '.auth-state.team.json')

test.describe('Equipe (CRUD, App Router)', () => {
  // Mesma disciplina de `users.spec.ts`: um login só por arquivo (rate limit
  // real de 10 tentativas/15min), os dois testes seriais para não competir
  // pelo mesmo `storageState`.
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const response = await context.post('/api/auth/login', { data: { email: 'admin@admin.com', password: 'password' } })
    expect(response.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.use({ storageState: STORAGE_STATE })

  test('lista carrega com o staff real e o link "Equipe" aparece no menu', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Equipe' })).toBeVisible()

    await page.goto('/team')
    await expect(page.getByRole('heading', { name: 'Equipe' })).toBeVisible()
    await expect(page.getByRole('row', { name: /admin@admin\.com/ })).toBeVisible()
  })

  test('fluxo completo: criar → reatribuir papel → desativar', async ({ page }) => {
    const uniqueEmail = `e2e-team-${Date.now()}@example.com`

    await page.goto('/team/create')
    // `{ exact: true }`: `getByLabel` do Playwright faz substring
    // case-insensitive por padrão — "Nome" sem isso também casaria com
    // "Sobrenome" (só este formulário tem os dois rótulos parecidos).
    await page.getByLabel('Nome', { exact: true }).fill('Staff E2E')
    await page.getByLabel('Sobrenome').fill('Teste')
    await page.getByLabel('E-mail').fill(uniqueEmail)
    await page.getByLabel('Senha').fill('senha-forte-123')
    await page.getByLabel('Papel').click()
    await page.getByRole('option', { name: 'staff', exact: true }).click()
    await page.getByRole('button', { name: 'Cadastrar' }).click()

    await page.waitForURL(/\/team\/?$/)
    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) })
    await expect(row).toBeVisible()
    await expect(row.getByText('staff', { exact: true })).toBeVisible()
    await expect(row.getByText('Ativo')).toBeVisible()

    // Reatribuir papel — staff → admin.
    await row.getByRole('link', { name: /Editar papel de/ }).click()
    await page.waitForURL(/\/team\/\d+\/edit\/?$/)
    await expect(page.getByText(uniqueEmail)).toBeVisible()
    await page.getByLabel('Papel').click()
    await page.getByRole('option', { name: 'admin', exact: true }).click()
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    await page.waitForURL(/\/team\/?$/)
    const rowAfterReassign = page.getByRole('row', { name: new RegExp(uniqueEmail) })
    await expect(rowAfterReassign.getByText('admin', { exact: true })).toBeVisible()

    // Desativar — passa pelo ConfirmDialog (não window.confirm nativo).
    await rowAfterReassign.getByRole('button', { name: /Desativar/ }).click()
    await expect(page.getByText('Desativar staff?')).toBeVisible()
    await page.getByRole('button', { name: 'Desativar' }).click()

    await expect(page.getByText('Staff desativado com sucesso')).toBeVisible({ timeout: 15000 })
    const rowAfterDeactivate = page.getByRole('row', { name: new RegExp(uniqueEmail) })
    await expect(rowAfterDeactivate.getByText('Inativo')).toBeVisible()
    await expect(rowAfterDeactivate.getByRole('button', { name: /Desativar/ })).not.toBeVisible()
  })
})
