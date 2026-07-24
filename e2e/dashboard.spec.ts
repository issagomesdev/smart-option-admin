import { expect, test } from '@playwright/test'

/**
 * Fluxo completo real (browser, não só `request`): visitar `/` deslogado →
 * middleware redireciona para `/login` → login de verdade contra o backend
 * → Dashboard com dados reais → logout → `/` volta a redirecionar. Só um
 * login por arquivo (mesmo motivo do `e2e/auth.spec.ts`: rate limit real de
 * 10 tentativas/15min na rota de login).
 */
test.describe('Dashboard (App Router, primeira tela migrada)', () => {
  test('/ deslogado redireciona para /login (middleware)', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Smart Option Admin' })).toBeVisible()
  })

  test('login real → Dashboard com dados reais → logout → / redireciona de novo', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('admin@admin.com')
    await page.getByLabel('Senha', { exact: true }).fill('password')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForURL('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    // Estatísticas reais vindas do backend (não mockadas) — só confere que o
    // número renderizado é um inteiro não-negativo, não um valor fixo (os
    // dados do ambiente de dev mudam).
    await expect(page.getByText('Total de Usuários')).toBeVisible()
    const totalUsersCard = page.locator('text=Total de Usuários').locator('..')
    await expect(totalUsersCard.getByText(/^\d+$/)).toBeVisible()

    // Navegação lateral funciona (mesmo que /users ainda seja a tela antiga).
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usuários' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Solicitações' })).toBeVisible()

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
