import {
  backendLoginResponseSchema,
  backendRefreshResponseSchema,
  backendTokenResponseSchema,
  type LoginInput,
  type SessionUser
} from '@/domain/dtos/auth.dto'
import { BackendApiError, backendFetch } from './backend-client'
import {
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
  getRememberPreference,
  setSessionCookies
} from './cookies'

interface AuthorizedFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  cache?: RequestCache
}

export async function loginWithBackend(input: LoginInput): Promise<SessionUser> {
  const data = await backendFetch('/api/auth', { method: 'POST', body: input })
  const parsed = backendLoginResponseSchema.parse(data)

  await setSessionCookies({
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken,
    remember: input.remember ?? false
  })

  return parsed.user
}

/**
 * Troca o refresh token atual por um par novo (rotação — o backend revoga o
 * token apresentado a cada uso). Devolve `false` sem lançar em qualquer
 * falha (token ausente/expirado/reuso detectado) — quem chama decide o que
 * fazer (redirecionar para /login, por exemplo), a função só garante que os
 * cookies nunca ficam com um token já revogado.
 */
export async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return false

  try {
    const data = await backendFetch('/api/auth/refresh', { method: 'POST', body: { refreshToken } })
    const parsed = backendRefreshResponseSchema.parse(data)
    const remember = await getRememberPreference()

    await setSessionCookies({ accessToken: parsed.accessToken, refreshToken: parsed.refreshToken, remember })
    return true
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 401) {
      await clearSessionCookies()
    }
    return false
  }
}

export async function logoutSession(): Promise<void> {
  const refreshToken = await getRefreshToken()

  if (refreshToken) {
    // Best-effort: se o backend estiver fora do ar, ainda assim limpamos os
    // cookies locais — o usuário não pode ficar preso numa sessão que ele
    // pediu para encerrar só porque o backend não respondeu.
    await backendFetch('/api/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined)
  }

  await clearSessionCookies()
}

/**
 * Sessão atual a partir do access token no cookie httpOnly — usada pelo
 * middleware e pela rota `GET /api/auth/me`. Tenta renovar uma vez via
 * refresh token se o access token já tiver expirado, antes de desistir.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  try {
    const data = await backendFetch('/api/auth/token', { method: 'POST', accessToken })
    return backendTokenResponseSchema.parse(data).user
  } catch (error) {
    if (!(error instanceof BackendApiError) || error.status !== 401) throw error
  }

  const refreshed = await refreshSession()
  if (!refreshed) return null

  const newAccessToken = await getAccessToken()
  if (!newAccessToken) return null

  const data = await backendFetch('/api/auth/token', { method: 'POST', accessToken: newAccessToken })
  return backendTokenResponseSchema.parse(data).user
}

/**
 * Ponto de entrada único para os clients de domínio (users/requests/network/
 * dashboard): injeta o access token do cookie e, se o backend responder 401
 * (token expirado — o caso normal a cada 14-15min), tenta renovar via
 * refresh token uma vez e repete a chamada original antes de desistir. É
 * exatamente o fluxo que faltava no painel antigo (guardava um token só e
 * nunca chamava `/refresh`, derrubando a sessão a cada 15 minutos).
 */
export async function authorizedFetch<T>(path: string, options: AuthorizedFetchOptions = {}): Promise<T> {
  const accessToken = await getAccessToken()
  if (!accessToken) throw new BackendApiError(401, 'UNAUTHORIZED', 'Sessão não encontrada')

  try {
    return await backendFetch<T>(path, { ...options, accessToken })
  } catch (error) {
    if (!(error instanceof BackendApiError) || error.status !== 401) throw error

    const refreshed = await refreshSession()
    if (!refreshed) throw error

    const newAccessToken = await getAccessToken()
    if (!newAccessToken) throw error

    return backendFetch<T>(path, { ...options, accessToken: newAccessToken })
  }
}
