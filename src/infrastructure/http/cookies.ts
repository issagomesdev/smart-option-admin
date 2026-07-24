import { cookies } from 'next/headers'

export const ACCESS_TOKEN_COOKIE = 'so_admin_access_token'
export const REFRESH_TOKEN_COOKIE = 'so_admin_refresh_token'
/** Não é secreto — só guarda a preferência "manter conectado" para reaplicar o mesmo `maxAge` a cada renovação (ver `refreshSession`). */
export const REMEMBER_COOKIE = 'so_admin_remember'

// Mesmo padrão do backend (`JWT_ACCESS_EXPIRES_IN` default) — o cookie some
// pouco antes do token realmente expirar, então o próximo request já cai no
// fluxo de refresh em vez de mandar um access token vencido.
const ACCESS_TOKEN_MAX_AGE_SECONDS = 14 * 60
// Mesmo padrão do backend (`JWT_REFRESH_EXPIRES_IN` default) para sessões
// "lembrar de mim". Sessões normais usam cookie de sessão (sem `maxAge`) —
// o backend já expira o refresh token em 24h nesse caso de qualquer forma.
const REMEMBER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

const isProduction = process.env.NODE_ENV === 'production'

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/'
}

interface SetSessionCookiesInput {
  accessToken: string
  refreshToken: string
  remember: boolean
}

export async function setSessionCookies({
  accessToken,
  refreshToken,
  remember
}: SetSessionCookiesInput): Promise<void> {
  const store = await cookies()

  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS })
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: remember ? REMEMBER_MAX_AGE_SECONDS : undefined
  })
  store.set(REMEMBER_COOKIE, remember ? '1' : '0', {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: remember ? REMEMBER_MAX_AGE_SECONDS : undefined
  })
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(ACCESS_TOKEN_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(REFRESH_TOKEN_COOKIE)?.value
}

export async function getRememberPreference(): Promise<boolean> {
  const store = await cookies()
  return store.get(REMEMBER_COOKIE)?.value === '1'
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_TOKEN_COOKIE)
  store.delete(REFRESH_TOKEN_COOKIE)
  store.delete(REMEMBER_COOKIE)
}
