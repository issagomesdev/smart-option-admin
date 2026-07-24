import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
}

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(store)
}))

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_COOKIE,
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
  getRememberPreference,
  setSessionCookies
} from './cookies'

/**
 * Núcleo do BFF de sessão (Fase 6 — auditoria de cobertura encontrou 0% aqui,
 * apesar de ser o código mais sensível do painel: onde os tokens ficam
 * guardados). `e2e/auth.spec.ts` já prova o fluxo de ponta a ponta contra o
 * backend real — este arquivo prova os casos de borda de cada função
 * isoladamente, sem depender de uma rodada E2E inteira para pegar uma
 * regressão aqui.
 */
describe('cookies (BFF de sessão)', () => {
  beforeEach(() => {
    store.get.mockReset()
    store.set.mockReset()
    store.delete.mockReset()
  })

  describe('setSessionCookies', () => {
    it('access token e refresh token são httpOnly; a preferência "remember" não é (o client precisa lê-la)', async () => {
      await setSessionCookies({ accessToken: 'access-1', refreshToken: 'refresh-1', remember: false })

      expect(store.set).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        'access-1',
        expect.objectContaining({ httpOnly: true })
      )
      expect(store.set).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        'refresh-1',
        expect.objectContaining({ httpOnly: true })
      )
      expect(store.set).toHaveBeenCalledWith(REMEMBER_COOKIE, '0', expect.objectContaining({ httpOnly: false }))
    })

    it('remember=false: refresh token e a preferência viram cookie de sessão (sem maxAge)', async () => {
      await setSessionCookies({ accessToken: 'a', refreshToken: 'r', remember: false })

      const refreshCall = store.set.mock.calls.find(call => call[0] === REFRESH_TOKEN_COOKIE)
      const rememberCall = store.set.mock.calls.find(call => call[0] === REMEMBER_COOKIE)
      expect(refreshCall?.[2].maxAge).toBeUndefined()
      expect(rememberCall?.[2].maxAge).toBeUndefined()
    })

    it('remember=true: refresh token e a preferência ganham maxAge de 30 dias', async () => {
      await setSessionCookies({ accessToken: 'a', refreshToken: 'r', remember: true })

      const refreshCall = store.set.mock.calls.find(call => call[0] === REFRESH_TOKEN_COOKIE)
      const rememberCall = store.set.mock.calls.find(call => call[0] === REMEMBER_COOKIE)
      expect(refreshCall?.[2].maxAge).toBe(30 * 24 * 60 * 60)
      expect(rememberCall?.[2].maxAge).toBe(30 * 24 * 60 * 60)
      expect(rememberCall?.[1]).toBe('1')
    })

    it('access token sempre tem maxAge de 14 minutos, com ou sem remember', async () => {
      await setSessionCookies({ accessToken: 'a', refreshToken: 'r', remember: true })
      const accessCall = store.set.mock.calls.find(call => call[0] === ACCESS_TOKEN_COOKIE)
      expect(accessCall?.[2].maxAge).toBe(14 * 60)
    })
  })

  describe('getAccessToken / getRefreshToken', () => {
    it('devolve o valor do cookie quando presente', async () => {
      store.get.mockImplementation((name: string) =>
        name === ACCESS_TOKEN_COOKIE ? { value: 'token-abc' } : undefined
      )
      expect(await getAccessToken()).toBe('token-abc')
    })

    it('devolve undefined quando o cookie não existe (sessão não autenticada)', async () => {
      store.get.mockReturnValue(undefined)
      expect(await getAccessToken()).toBeUndefined()
      expect(await getRefreshToken()).toBeUndefined()
    })
  })

  describe('getRememberPreference', () => {
    it('só é true quando o valor salvo é exatamente "1"', async () => {
      store.get.mockReturnValue({ value: '1' })
      expect(await getRememberPreference()).toBe(true)
    })

    it('é false para "0" e para cookie ausente', async () => {
      store.get.mockReturnValue({ value: '0' })
      expect(await getRememberPreference()).toBe(false)

      store.get.mockReturnValue(undefined)
      expect(await getRememberPreference()).toBe(false)
    })
  })

  describe('clearSessionCookies', () => {
    it('remove os 3 cookies da sessão', async () => {
      await clearSessionCookies()
      expect(store.delete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE)
      expect(store.delete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE)
      expect(store.delete).toHaveBeenCalledWith(REMEMBER_COOKIE)
    })
  })
})
