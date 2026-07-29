import { beforeAll, describe, expect, it } from 'vitest'
import { backendFetch } from '../../infrastructure/http/backend-client'
import { backendLoginResponseSchema } from './auth.dto'
import { dashboardSummarySchema, plansResponseSchema } from './dashboard.dto'
import { networkResponseSchema } from './network.dto'
import { extractResponseSchema, pendenciesResponseSchema, paginatedWithdrawalsSchema } from './requests.dto'
import { botUserDetailSchema, paginatedBotUsersSchema } from './users.dto'

/**
 * Verificação de campo-a-campo ao vivo contra o backend real (exigida pelo
 * plano aprovado para a Fase 2): chama `backendFetch` direto (sem passar
 * pelos cookies httpOnly — isso é coberto à parte pelos testes E2E de
 * `e2e/auth.spec.ts`) e confirma que a resposta de verdade do backend passa
 * pelo  de cada schema sem lançar.
 *
 * O usuário usado nas chamadas por id é resolvido em tempo de execução, a partir da própria
 * listagem — antes era um id fixo do banco de desenvolvimento, o que fazia a suíte inteira quebrar
 * sempre que os dados eram regenerados (`npm run demo:seed`). O objetivo aqui é validar o formato
 * da resposta, não a existência de um registro específico.
 */
describe('Contrato dos DTOs vs. backend real (integração)', () => {
  let testUserId: number
  let accessToken: string

  beforeAll(async () => {
    const data = await backendFetch('/api/auth', {
      method: 'POST',
      body: { email: 'admin@admin.com', password: 'password' }
    })
    accessToken = backendLoginResponseSchema.parse(data).accessToken

    const users = await backendFetch('/api/users/users-bot', {
      method: 'POST',
      accessToken,
      body: { page: 1, limit: 1 }
    })
    testUserId = paginatedBotUsersSchema.parse(users).data[0].id
  })

  it('paginatedBotUsersSchema confere com POST /api/users/users-bot', async () => {
    const data = await backendFetch('/api/users/users-bot', {
      method: 'POST',
      accessToken,
      body: { page: 1, limit: 10 }
    })

    const parsed = paginatedBotUsersSchema.parse(data)
    expect(parsed.data.length).toBeGreaterThan(0)
    expect(parsed.pagination.page).toBe(1)
  })

  it('botUserDetailSchema confere com GET /api/users/user-bot/:id', async () => {
    const data = await backendFetch(`/api/users/user-bot/${testUserId}`, { accessToken })
    const parsed = botUserDetailSchema.parse(data)
    expect(parsed.id).toBe(testUserId)
  })

  it('paginatedWithdrawalsSchema confere com POST /api/requests/withdrawal/:id (página vazia)', async () => {
    const data = await backendFetch(`/api/requests/withdrawal/${testUserId}`, {
      method: 'POST',
      accessToken,
      body: { page: 1, limit: 5 }
    })

    const parsed = paginatedWithdrawalsSchema.parse(data)
    expect(parsed.pagination).toMatchObject({ page: 1, limit: 5 })
  })

  it('extractResponseSchema confere com POST /api/requests/extract/:id', async () => {
    const data = await backendFetch(`/api/requests/extract/${testUserId}`, { method: 'POST', accessToken, body: {} })
    const parsed = extractResponseSchema.parse(data)
    expect(parsed.balance).toBeGreaterThanOrEqual(0)
  })

  it('pendenciesResponseSchema confere com GET /api/requests/pendencies', async () => {
    const data = await backendFetch('/api/requests/pendencies', { accessToken })
    const parsed = pendenciesResponseSchema.parse(data)
    expect(parsed.map(entry => entry.requests)).toEqual(['withdrawals', 'support'])
  })

  it('networkResponseSchema confere com POST /api/network/:id', async () => {
    const data = await backendFetch(`/api/network/${testUserId}`, {
      method: 'POST',
      accessToken,
      body: { page: 1, limit: 5 }
    })
    networkResponseSchema.parse(data)
  })

  it('dashboardSummarySchema confere com GET /api/dashboard/summary', async () => {
    const data = await backendFetch('/api/dashboard/summary?period=30d', { accessToken })
    const parsed = dashboardSummarySchema.parse(data)
    expect(parsed.chart.points.length).toBeGreaterThan(0)
  })

  it('plansResponseSchema confere com GET /api/dashboard/plans', async () => {
    const data = await backendFetch('/api/dashboard/plans', { accessToken })
    const parsed = plansResponseSchema.parse(data)
    expect(parsed.map(plan => plan.name)).toEqual(['bronze', 'silver', 'gold', 'diamond'])
  })
})
