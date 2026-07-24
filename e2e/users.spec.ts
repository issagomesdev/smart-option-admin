import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const STORAGE_STATE = path.join(__dirname, '.auth-state.users.json')

test.describe('Usuários (CRUD, App Router)', () => {
  // `mode: 'serial'` obriga os dois testes a rodar no mesmo worker, em
  // sequência — sem isso, `fullyParallel` poderia escalar cada teste deste
  // describe para um worker diferente, cada um disparando seu próprio
  // `beforeAll` concorrentemente e correndo para ler/escrever o mesmo
  // arquivo de `storageState`. Mesma disciplina de login único por arquivo
  // de `auth.spec.ts`/`dashboard.spec.ts` (rate limit real de 10
  // tentativas/15min na rota de login).
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    // `storageState: undefined` sobrescreve o `test.use({storageState: STORAGE_STATE})`
    // abaixo, que senão vaza como default para este `newContext()` também
    // (mesma AsyncLocalStorage de opções do arquivo) — sem isso o Playwright
    // tenta ler o arquivo de sessão antes dele existir (é este `beforeAll`
    // quem o cria).
    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const response = await context.post('/api/auth/login', { data: { email: 'admin@admin.com', password: 'password' } })
    expect(response.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.use({ storageState: STORAGE_STATE })

  test('lista carrega com dados reais e filtro por e-mail funciona', async ({ page }) => {
    await page.goto('/users')

    await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Nome' })).toBeVisible()
    await expect(page.getByRole('row')).toHaveCount(await page.getByRole('row').count())

    await page.getByLabel('E-mail').fill('nao-existe-nenhum-usuario-assim@example.com')
    await expect(page.getByText('Nenhum usuário encontrado')).toBeVisible()
  })

  test('fluxo completo: criar → visualizar → editar → bloquear/desbloquear → excluir', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`

    await page.goto('/users/create')
    await page.getByLabel('Nome').fill('Usuário E2E')
    await page.getByLabel('E-mail').fill(uniqueEmail)
    await page.getByLabel('Senha', { exact: true }).fill('senha123')
    // CPF com dígito verificador válido — o backend valida de verdade (não
    // aceita qualquer sequência de 11 dígitos).
    await page.getByLabel('CPF').fill('52998224725')
    await page.getByLabel('Telefone').fill('11999999999')
    await page.getByLabel('Endereço').fill('Rua de Teste, 123')
    await page.getByLabel('Chave Pix').fill(`pix-${uniqueEmail}`)
    await page.getByRole('button', { name: 'Cadastrar' }).click()

    // `trailingSlash: true` no `next.config.js` — a URL final é `/users/`.
    await page.waitForURL(/\/users\/?$/)
    await page.getByLabel('E-mail').fill(uniqueEmail)
    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) })
    await expect(row).toBeVisible()

    // Visualizar.
    await row.getByRole('link', { name: 'Usuário E2E' }).click()
    await page.waitForURL(/\/users\/\d+\/?$/)
    await expect(page.getByRole('heading', { name: 'Usuário E2E' })).toBeVisible()
    await expect(page.getByText(uniqueEmail, { exact: true })).toBeVisible()

    // Editar — muda o telefone e confere que persistiu.
    await page.getByRole('link', { name: 'Editar' }).click()
    await page.waitForURL(/\/users\/\d+\/edit\/?$/)
    const phoneField = page.getByLabel('Telefone')
    await phoneField.fill('')
    await phoneField.fill('11888888888')
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    // `trailingSlash: true` no `next.config.js` — a URL final é `/users/`.
    await page.waitForURL(/\/users\/?$/)
    await page.getByLabel('E-mail').fill(uniqueEmail)
    await expect(page.getByRole('row', { name: new RegExp(uniqueEmail) })).toBeVisible()

    // Bloquear / desbloquear via Switch da listagem.
    const blockSwitch = page.getByRole('row', { name: new RegExp(uniqueEmail) }).getByRole('switch')
    await expect(blockSwitch).not.toBeChecked()
    await blockSwitch.click()
    await expect(page.getByText('Usuário bloqueado')).toBeVisible()
    await expect(blockSwitch).toBeChecked()
    await blockSwitch.click()
    await expect(page.getByText('Usuário desbloqueado')).toBeVisible()

    // Excluir — passa pelo ConfirmDialog (não window.confirm nativo).
    await page.getByRole('button', { name: /^Ações de/ }).click()
    await page.getByRole('menuitem', { name: 'Excluir' }).click()
    await expect(page.getByText('Excluir usuário?')).toBeVisible()
    await page.getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Usuário excluído com sucesso')).toBeVisible({ timeout: 15000 })
    await page.getByLabel('E-mail').fill(uniqueEmail)
    await expect(page.getByText('Nenhum usuário encontrado')).toBeVisible()
  })
})
