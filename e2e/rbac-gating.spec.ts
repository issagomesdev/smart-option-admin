import path from 'node:path'
import { expect, request as playwrightRequest, test } from '@playwright/test'

const PORT = 3001
const BACKEND_URL = 'http://localhost:3000'
const STORAGE_STATE = path.join(__dirname, '.auth-state.rbac-gating.json')

/**
 * Fase 5 (parte 6) do RBAC: gating client-side (esconder/desabilitar ação)
 * nas telas de Usuários/Solicitações. O resto da suíte E2E deste projeto usa
 * só `admin@admin.com` (as 6 permissões) — o que prova que nada quebrou para
 * quem já tinha acesso, mas não prova que o gating de fato esconde algo para
 * quem não tem permissão. Este spec cria um staff descartável sem nenhuma
 * permissão via a API real do backend (`POST /api/staff`, papel `staff` —
 * `roleId: 2`, sempre semeado vazio), loga como ele de verdade no painel, e
 * confirma que as ações de escrita somem/desabilitam na UI real.
 */
test.describe('RBAC — gating client-side para staff sem permissões', () => {
  test.describe.configure({ mode: 'serial' })

  let staffId: number
  const email = `rbac-gating-${Date.now()}@test.local`
  const password = 'senha-forte-123'

  test.beforeAll(async () => {
    const adminLogin = await fetch(`${BACKEND_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'password' })
    })
    const adminBody = await adminLogin.json()
    const adminToken: string = adminBody.data.accessToken

    const createStaff = await fetch(`${BACKEND_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'RBAC', surname: 'Gating Test', email, password, roleId: 2 })
    })
    const staffBody = await createStaff.json()
    staffId = staffBody.data.id

    const context = await playwrightRequest.newContext({ baseURL: `http://localhost:${PORT}`, storageState: undefined })
    const loginResponse = await context.post('/api/auth/login', { data: { email, password } })
    expect(loginResponse.status()).toBe(200)
    await context.storageState({ path: STORAGE_STATE })
    await context.dispose()
  })

  test.afterAll(async () => {
    const adminLogin = await fetch(`${BACKEND_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'password' })
    })
    const adminBody = await adminLogin.json()
    const adminToken: string = adminBody.data.accessToken

    if (staffId) {
      await fetch(`${BACKEND_URL}/api/staff/${staffId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    }
  })

  test.use({ storageState: STORAGE_STATE })

  test('não vê "Novo usuário", nem Editar/Ajustar saldo/Excluir no menu de ações de um usuário', async ({ page }) => {
    await page.goto('/users')
    await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible()

    await expect(page.getByRole('button', { name: 'Novo usuário' })).not.toBeVisible()

    const firstActionsButton = page.getByRole('button', { name: /Ações de/ }).first()
    await firstActionsButton.waitFor()
    await firstActionsButton.click()

    await expect(page.getByRole('menuitem', { name: /Visualizar/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Editar/ })).not.toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Ajustar saldo/ })).not.toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Excluir/ })).not.toBeVisible()
  })

  test('o switch de bloqueio/desbloqueio fica desabilitado na lista de usuários', async ({ page }) => {
    await page.goto('/users')

    const firstSwitch = page.locator('input[type="checkbox"][aria-label*="loquear"]').first()
    await firstSwitch.waitFor()
    await expect(firstSwitch).toBeDisabled()
  })

  test('nunca mostra "Responder" para uma solicitação de saque, independente do status', async ({ page }) => {
    await page.goto('/requests')
    await expect(page.getByRole('heading', { name: 'Solicitações' })).toBeVisible()

    // `withdrawals.approve` ausente: "Responder" só aparece quando o status é
    // pendente E o staff tem a permissão — sem ela, nunca deveria aparecer,
    // independente de existir ou não uma solicitação pendente nos dados reais.
    await expect(page.getByRole('button', { name: 'Responder' })).toHaveCount(0)
  })

  // Fase 5 (parte 7): `/team` é um recurso "tudo ou nada" — cada página
  // gateia server-side (não só o item de menu escondido), então navegar
  // direto pela URL (não só clicar num link) precisa redirecionar também.
  test('sem staff.manage, "Equipe" some do menu e /team redireciona para o Dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Equipe' })).not.toBeVisible()

    await page.goto('/team')
    await page.waitForURL('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('sem staff.manage, /team/create redireciona para o Dashboard', async ({ page }) => {
    await page.goto('/team/create')
    await page.waitForURL('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  // Fase 5 (parte 8): `/team/roles` é gateado por `roles.manage`, uma
  // permissão diferente e mais estrita que `staff.manage` — este staff não
  // tem nenhuma das duas, então o mesmo teste também cobre esse caso.
  test('sem roles.manage, /team/roles redireciona para o Dashboard', async ({ page }) => {
    await page.goto('/team/roles')
    await page.waitForURL('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('sem roles.manage, /team/roles/create redireciona para o Dashboard', async ({ page }) => {
    await page.goto('/team/roles/create')
    await page.waitForURL('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})
