import { beforeAll, describe, expect, it } from 'vitest'
import { backendLoginResponseSchema } from '@/domain/dtos/auth.dto'
import { BackendApiError, backendFetch } from './backend-client'

/**
 * Testa `backendFetch` direto contra o backend real (`docker-compose.dev.yml`,
 * mesmo ambiente usado pelos testes de integração do backend) — não usa
 * `next/headers`, então roda em Vitest puro, sem precisar de um request
 * context do Next.js (isso é testado à parte via Playwright, em `e2e/`).
 *
 * Login acontece uma única vez em `beforeAll` — a rota de login tem rate
 * limit real (10 tentativas/15min por IP, propositalmente restritivo contra
 * brute-force), então um `it()` por login esgotaria o limite rapidamente.
 */
describe('backendFetch (integração, backend real)', () => {
  let accessToken: string

  beforeAll(async () => {
    const data = await backendFetch('/api/auth', {
      method: 'POST',
      body: { email: 'admin@admin.com', password: 'password' }
    })
    accessToken = backendLoginResponseSchema.parse(data).accessToken
  })

  it('devolve `data` já desembrulhado do envelope em uma chamada de sucesso', async () => {
    const data = await backendFetch('/api/auth/token', { method: 'POST', accessToken })
    expect(data).toMatchObject({ user: { email: 'admin@admin.com' } })
  })

  it('lança BackendApiError com o code/message/status reais do backend em credenciais inválidas', async () => {
    await expect(
      backendFetch('/api/auth', { method: 'POST', body: { email: 'admin@admin.com', password: 'senha-errada' } })
    ).rejects.toMatchObject({
      name: 'BackendApiError',
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Email e/ou senha inválidos'
    })
  })

  it('lança BackendApiError 401 ao chamar uma rota protegida sem token', async () => {
    await expect(backendFetch('/api/dashboard/plans')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED'
    })
  })

  it('injeta o Authorization: Bearer e recebe 200 com um access token válido', async () => {
    const plans = await backendFetch('/api/dashboard/plans', { accessToken })
    expect(Array.isArray(plans)).toBe(true)
  })

  it('BackendApiError é uma instância de Error de verdade (name/message utilizáveis)', async () => {
    try {
      await backendFetch('/api/dashboard/plans', { accessToken: 'token-invalido' })
      expect.unreachable('deveria ter lançado')
    } catch (error) {
      expect(error).toBeInstanceOf(BackendApiError)
      expect(error).toBeInstanceOf(Error)
    }
  })
})
