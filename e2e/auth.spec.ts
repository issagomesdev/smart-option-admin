import { expect, test } from '@playwright/test'

/**
 * Testes de sistema do BFF de autenticação (Fase 2) — únicos testes deste
 * projeto que realmente exercitam `next/headers`/cookies httpOnly num
 * request context de verdade (Vitest não consegue: `cookies()` só funciona
 * dentro do runtime do Next.js). Rodam contra `npm run dev` de verdade
 * (`playwright.config.ts` já sobe o servidor) e, por baixo, contra o backend
 * real (`docker-compose.dev.yml`).
 */
test.describe('BFF de autenticação', () => {
  test('login → me → refresh → logout → me (fluxo completo)', async ({ request }) => {
    const loginResponse = await request.post('/api/auth/login', {
      data: { email: 'admin@admin.com', password: 'password' }
    })

    expect(loginResponse.status()).toBe(200)
    const loginBody = await loginResponse.json()
    expect(loginBody).toMatchObject({ success: true, data: { user: { email: 'admin@admin.com' } } })
    // O token nunca pode vazar no corpo da resposta — só nos cookies httpOnly.
    expect(JSON.stringify(loginBody)).not.toMatch(/accessToken|refreshToken/)

    const setCookieHeader = loginResponse.headers()['set-cookie'] ?? ''
    expect(setCookieHeader).toContain('so_admin_access_token=')
    expect(setCookieHeader).toContain('so_admin_refresh_token=')
    expect(setCookieHeader.toLowerCase()).toContain('httponly')

    const meResponse = await request.get('/api/auth/me')
    expect(meResponse.status()).toBe(200)
    expect(await meResponse.json()).toMatchObject({ success: true, data: { user: { email: 'admin@admin.com' } } })

    const refreshResponse = await request.post('/api/auth/refresh')
    expect(refreshResponse.status()).toBe(200)
    expect(await refreshResponse.json()).toMatchObject({ success: true, data: { refreshed: true } })
    // Rotação de verdade: o refresh token velho foi revogado no backend, o
    // navegador (aqui, o `request` context do Playwright) já está com o novo.
    expect(refreshResponse.headers()['set-cookie'] ?? '').toContain('so_admin_refresh_token=')

    const meAfterRefresh = await request.get('/api/auth/me')
    expect(meAfterRefresh.status()).toBe(200)

    const logoutResponse = await request.post('/api/auth/logout')
    expect(logoutResponse.status()).toBe(200)
    expect(await logoutResponse.json()).toMatchObject({ success: true, data: { loggedOut: true } })

    const meAfterLogout = await request.get('/api/auth/me')
    expect(meAfterLogout.status()).toBe(401)
  })

  test('login com credenciais inválidas devolve 401 e não seta cookie nenhum', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'admin@admin.com', password: 'senha-errada' }
    })

    expect(response.status()).toBe(401)
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Email e/ou senha inválidos' }
    })
    expect(response.headers()['set-cookie']).toBeUndefined()
  })

  test('login com corpo inválido (sem email) devolve 400 de validação, sem chamar o backend', async ({ request }) => {
    const response = await request.post('/api/auth/login', { data: { password: 'password' } })

    expect(response.status()).toBe(400)
    expect(await response.json()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } })
  })

  test('/api/auth/me sem sessão devolve 401', async ({ request }) => {
    const response = await request.get('/api/auth/me')
    expect(response.status()).toBe(401)
    expect(await response.json()).toMatchObject({ success: false, error: { code: 'UNAUTHORIZED' } })
  })
})
