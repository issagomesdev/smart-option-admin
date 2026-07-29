import { expect, test } from '@playwright/test'

/**
 * Fluxo completo real (browser, não só `request`): visitar `/` deslogado →
 * middleware redireciona para `/login` → login de verdade contra o backend
 * → Dashboard v2 (KPIs + gráfico + indicador + movimentações) com dados
 * reais → logout → `/` volta a redirecionar. Só um login por arquivo (mesmo
 * motivo do `e2e/auth.spec.ts`: rate limit real de 10 tentativas/15min na
 * rota de login) — por isso o conteúdo novo do dashboard é conferido dentro
 * do mesmo teste que já fazia login/logout, em vez de um teste próprio.
 */
test.describe('Dashboard (App Router, agregador v2)', () => {
  test('/ deslogado redireciona para /login (middleware)', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Smart Option Admin' })).toBeVisible()
  })

  test('login real → Dashboard v2 com dados reais → logout → / redireciona de novo', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('admin@admin.com')
    await page.getByLabel('Senha', { exact: true }).fill('password')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForURL('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    // Os 4 KPIs (dados reais do backend, não mockados — só confere que cada
    // card renderizou, não um valor fixo, já que o ambiente de dev muda).
    await expect(page.getByText('Usuários ativos')).toBeVisible()
    await expect(page.getByText('Saldo da rede')).toBeVisible()
    await expect(page.getByText('Depósitos')).toBeVisible()
    await expect(page.getByText('Saques pendentes')).toBeVisible()

    // Seletor de período reage e recarrega o dashboard inteiro.
    await expect(page.getByRole('button', { name: 'Hoje' })).toBeVisible()
    await page.getByRole('button', { name: '7 dias' }).click()
    await expect(page.getByRole('button', { name: '7 dias' })).toHaveAttribute('aria-pressed', 'true')

    // Gráfico de rentabilidade + indicador circular + movimentações recentes.
    await expect(page.getByText('Rentabilidade da rede', { exact: true })).toBeVisible()
    await expect(page.getByText('Solicitações aprovadas hoje')).toBeVisible()
    await expect(page.getByText('Movimentações recentes')).toBeVisible()

    // "Ver todas" leva para a Auditoria.
    await page.getByRole('link', { name: 'Ver todas' }).click()
    await page.waitForURL(/\/audit\/?$/)
    await expect(page.getByRole('heading', { name: 'Auditoria' })).toBeVisible()
    await page.goBack()
    await page.waitForURL('/')

    // Navegação lateral funciona, incluindo o item novo desta fase.
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usuários' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Solicitações' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Auditoria' })).toBeVisible()

    // Logout via menu do usuário.
    await page.getByRole('button', { name: 'Menu do usuário' }).click()
    await page.getByText('Sair').click()
    await page.waitForURL(/\/login/)

    // Sessão de verdade encerrada — voltar para / redireciona outra vez.
    await page.goto('/')
    await page.waitForURL(/\/login/)
  })

  test('login com credenciais inválidas mostra erro inline e não navega', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('admin@admin.com')
    await page.getByLabel('Senha', { exact: true }).fill('senha-errada-de-verdade')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Email e/ou senha inválidos')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
})
