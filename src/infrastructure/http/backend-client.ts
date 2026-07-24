import { env } from '@/config/env'
import type { ApiEnvelope } from '@/domain/dtos/common.dto'

export class BackendApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'BackendApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

interface BackendFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  accessToken?: string
  /** `next/cache` — dados administrativos mudam a qualquer momento, então o default é sempre buscar de novo. */
  cache?: RequestCache
}

/**
 * Client HTTP central server-side para o backend (`smart-option/`). Só roda
 * em Route Handlers/Server Components — nunca importado por código que
 * também é bundlado para o browser, já que injeta o `accessToken` no header
 * `Authorization`.
 */
export async function backendFetch<T>(path: string, options: BackendFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken, cache = 'no-store' } = options

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(`${env.BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache
    })
  } catch (error) {
    throw new BackendApiError(502, 'BACKEND_UNREACHABLE', 'Não foi possível conectar ao backend', error)
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!payload) {
    throw new BackendApiError(response.status, 'INVALID_RESPONSE', 'Resposta inválida do backend')
  }

  if (!payload.success) {
    throw new BackendApiError(response.status, payload.error.code, payload.error.message, payload.error.details)
  }

  return payload.data
}
