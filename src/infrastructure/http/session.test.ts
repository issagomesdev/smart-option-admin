import { beforeEach, describe, expect, it, vi } from 'vitest'

const backendFetch = vi.fn()

vi.mock('./backend-client', async importOriginal => {
  const actual = await importOriginal<typeof import('./backend-client')>()
  return { ...actual, backendFetch: (...args: unknown[]) => backendFetch(...args) }
})

const setSessionCookies = vi.fn()
const getAccessToken = vi.fn()
const getRefreshToken = vi.fn()
const getRememberPreference = vi.fn()
const clearSessionCookies = vi.fn()

vi.mock('./cookies', () => ({
  setSessionCookies: (...args: unknown[]) => setSessionCookies(...args),
  getAccessToken: (...args: unknown[]) => getAccessToken(...args),
  getRefreshToken: (...args: unknown[]) => getRefreshToken(...args),
  getRememberPreference: (...args: unknown[]) => getRememberPreference(...args),
  clearSessionCookies: (...args: unknown[]) => clearSessionCookies(...args)
}))

import { BackendApiError } from './backend-client'
import { authorizedFetch, getCurrentUser, loginWithBackend, logoutSession, refreshSession } from './session'

const SESSION_USER = { id: 1, name: 'Admin', surname: 'Teste', email: 'admin@test.local', roleId: 1, permissions: [] }

/**
 * Núcleo do BFF de sessão (Fase 6 — auditoria de cobertura encontrou 0%
 * aqui). `e2e/auth.spec.ts` já prova o fluxo feliz de ponta a ponta contra o
 * backend real; este arquivo cobre os casos de borda (falha de refresh,
 * erro não-401, cookie ausente) que um E2E não testa um por um.
 */
describe('session (BFF de autenticação)', () => {
  beforeEach(() => {
    backendFetch.mockReset()
    setSessionCookies.mockReset()
    getAccessToken.mockReset()
    getRefreshToken.mockReset()
    getRememberPreference.mockReset()
    clearSessionCookies.mockReset()
  })

  describe('loginWithBackend', () => {
    it('faz login, seta os cookies com o remember pedido e devolve o usuário', async () => {
      backendFetch.mockResolvedValue({
        auth: true,
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: SESSION_USER
      })

      const user = await loginWithBackend({ email: 'admin@test.local', password: 'senha', remember: true })

      expect(backendFetch).toHaveBeenCalledWith('/api/auth', {
        method: 'POST',
        body: { email: 'admin@test.local', password: 'senha', remember: true }
      })
      expect(setSessionCookies).toHaveBeenCalledWith({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        remember: true
      })
      expect(user).toEqual(SESSION_USER)
    })

    it('sem remember explícito, assume false', async () => {
      backendFetch.mockResolvedValue({ auth: true, accessToken: 'a', refreshToken: 'r', user: SESSION_USER })

      // `LoginInput` (tipo de saída do zod, `.default(false)` já aplicado)
      // garante `remember` sempre presente na prática — o cast aqui só
      // prova o fallback defensivo (`input.remember ?? false`) do próprio
      // código, não um input real possível hoje.
      await loginWithBackend({ email: 'admin@test.local', password: 'senha' } as Parameters<typeof loginWithBackend>[0])

      expect(setSessionCookies).toHaveBeenCalledWith(expect.objectContaining({ remember: false }))
    })
  })

  describe('refreshSession', () => {
    it('sem refresh token no cookie, devolve false sem chamar o backend', async () => {
      getRefreshToken.mockResolvedValue(undefined)

      const result = await refreshSession()

      expect(result).toBe(false)
      expect(backendFetch).not.toHaveBeenCalled()
    })

    it('sucesso: troca os cookies pelo par novo, preservando o remember atual, devolve true', async () => {
      getRefreshToken.mockResolvedValue('refresh-old')
      getRememberPreference.mockResolvedValue(true)
      backendFetch.mockResolvedValue({ accessToken: 'access-new', refreshToken: 'refresh-new' })

      const result = await refreshSession()

      expect(result).toBe(true)
      expect(setSessionCookies).toHaveBeenCalledWith({
        accessToken: 'access-new',
        refreshToken: 'refresh-new',
        remember: true
      })
    })

    it('falha com 401 (token revogado/expirado): limpa os cookies e devolve false', async () => {
      getRefreshToken.mockResolvedValue('refresh-old')
      backendFetch.mockRejectedValue(new BackendApiError(401, 'UNAUTHORIZED', 'Refresh token inválido'))

      const result = await refreshSession()

      expect(result).toBe(false)
      expect(clearSessionCookies).toHaveBeenCalled()
    })

    it('falha que não é 401 (ex.: backend fora do ar): NÃO limpa os cookies, devolve false', async () => {
      getRefreshToken.mockResolvedValue('refresh-old')
      backendFetch.mockRejectedValue(new BackendApiError(502, 'BACKEND_UNREACHABLE', 'Não foi possível conectar'))

      const result = await refreshSession()

      expect(result).toBe(false)
      expect(clearSessionCookies).not.toHaveBeenCalled()
    })
  })

  describe('logoutSession', () => {
    it('com refresh token: avisa o backend e limpa os cookies', async () => {
      getRefreshToken.mockResolvedValue('refresh-1')
      backendFetch.mockResolvedValue({ loggedOut: true })

      await logoutSession()

      expect(backendFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken: 'refresh-1' }
      })
      expect(clearSessionCookies).toHaveBeenCalled()
    })

    it('se o backend falhar (ex.: fora do ar), limpa os cookies mesmo assim (best-effort)', async () => {
      getRefreshToken.mockResolvedValue('refresh-1')
      backendFetch.mockRejectedValue(new BackendApiError(502, 'BACKEND_UNREACHABLE', 'Não foi possível conectar'))

      await expect(logoutSession()).resolves.toBeUndefined()
      expect(clearSessionCookies).toHaveBeenCalled()
    })

    it('sem refresh token, nem chama o backend — só limpa os cookies', async () => {
      getRefreshToken.mockResolvedValue(undefined)

      await logoutSession()

      expect(backendFetch).not.toHaveBeenCalled()
      expect(clearSessionCookies).toHaveBeenCalled()
    })
  })

  describe('getCurrentUser', () => {
    it('sem access token no cookie, devolve null sem chamar o backend', async () => {
      getAccessToken.mockResolvedValue(undefined)

      const user = await getCurrentUser()

      expect(user).toBeNull()
      expect(backendFetch).not.toHaveBeenCalled()
    })

    it('access token válido: devolve o usuário sem tentar refresh', async () => {
      getAccessToken.mockResolvedValue('access-1')
      backendFetch.mockResolvedValue({ user: SESSION_USER })

      const user = await getCurrentUser()

      expect(user).toEqual(SESSION_USER)
      expect(getRefreshToken).not.toHaveBeenCalled()
    })

    it('access token expirado (401): renova via refresh e repete a chamada com o token novo', async () => {
      getAccessToken.mockResolvedValueOnce('access-expired').mockResolvedValueOnce('access-new')
      getRefreshToken.mockResolvedValue('refresh-1')
      getRememberPreference.mockResolvedValue(false)
      backendFetch
        .mockRejectedValueOnce(new BackendApiError(401, 'UNAUTHORIZED', 'Token expirado'))
        .mockResolvedValueOnce({ accessToken: 'access-new', refreshToken: 'refresh-new' })
        .mockResolvedValueOnce({ user: SESSION_USER })

      const user = await getCurrentUser()

      expect(user).toEqual(SESSION_USER)
      expect(backendFetch).toHaveBeenLastCalledWith('/api/auth/token', { method: 'POST', accessToken: 'access-new' })
    })

    it('access token expirado e refresh também falha: devolve null', async () => {
      getAccessToken.mockResolvedValue('access-expired')
      getRefreshToken.mockResolvedValue('refresh-1')
      backendFetch.mockRejectedValue(new BackendApiError(401, 'UNAUTHORIZED', 'Token expirado'))

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('erro que não é 401 (ex.: backend fora do ar) propaga em vez de ser engolido', async () => {
      getAccessToken.mockResolvedValue('access-1')
      backendFetch.mockRejectedValue(new BackendApiError(502, 'BACKEND_UNREACHABLE', 'Não foi possível conectar'))

      await expect(getCurrentUser()).rejects.toThrow('Não foi possível conectar')
    })
  })

  describe('authorizedFetch', () => {
    it('sem access token, lança 401 sem chamar o backend', async () => {
      getAccessToken.mockResolvedValue(undefined)

      await expect(authorizedFetch('/api/staff')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
      expect(backendFetch).not.toHaveBeenCalled()
    })

    it('sucesso direto: devolve o dado, sem tentar refresh', async () => {
      getAccessToken.mockResolvedValue('access-1')
      backendFetch.mockResolvedValue({ ok: true })

      const data = await authorizedFetch('/api/staff')

      expect(data).toEqual({ ok: true })
      expect(getRefreshToken).not.toHaveBeenCalled()
    })

    it('401 na primeira tentativa: renova e repete a chamada original com o token novo', async () => {
      getAccessToken.mockResolvedValueOnce('access-expired').mockResolvedValueOnce('access-new')
      getRefreshToken.mockResolvedValue('refresh-1')
      getRememberPreference.mockResolvedValue(false)
      backendFetch
        .mockRejectedValueOnce(new BackendApiError(401, 'UNAUTHORIZED', 'Token expirado'))
        .mockResolvedValueOnce({ accessToken: 'access-new', refreshToken: 'refresh-new' })
        .mockResolvedValueOnce({ ok: true })

      const data = await authorizedFetch('/api/staff', { method: 'POST', body: { name: 'x' } })

      expect(data).toEqual({ ok: true })
      expect(backendFetch).toHaveBeenLastCalledWith('/api/staff', {
        method: 'POST',
        body: { name: 'x' },
        accessToken: 'access-new'
      })
    })

    it('401 e o refresh falha: relança o erro 401 original (não um erro novo)', async () => {
      getAccessToken.mockResolvedValue('access-expired')
      getRefreshToken.mockResolvedValue('refresh-1')
      const originalError = new BackendApiError(401, 'UNAUTHORIZED', 'Token expirado')
      backendFetch.mockRejectedValue(originalError)

      await expect(authorizedFetch('/api/staff')).rejects.toBe(originalError)
    })

    it('erro que não é 401 propaga imediatamente, sem tentar refresh', async () => {
      getAccessToken.mockResolvedValue('access-1')
      backendFetch.mockRejectedValue(new BackendApiError(500, 'INTERNAL', 'Erro interno'))

      await expect(authorizedFetch('/api/staff')).rejects.toMatchObject({ status: 500 })
      expect(getRefreshToken).not.toHaveBeenCalled()
    })
  })
})
