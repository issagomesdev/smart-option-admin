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
 * pelo `.parse()` de cada schema sem lançar. Usa o usuário de teste `id=284`
 * (`telegram_user_id` nulo) para não esbarrar num problema pré-existente e
 * não relacionado a esta fase: linhas com `telegram_user_id` de teste
 * inválido fazem `UsersService.botUsers` chamar a API do Telegram de
 * verdade e falhar (`ETELEGRAM: 400 chat not found`) — dado sujo do
 * ambiente de dev, não um bug do client novo.
 */
describe('Contrato dos DTOs vs. backend real (integração)', () => {
  const TEST_USER_ID = 284
  let accessToken: string

  beforeAll(async () => {
    const data = await backendFetch('/api/auth', {
      method: 'POST',
      body: { email: 'admin@admin.com', password: 'password' }
    })
    accessToken = backendLoginResponseSchema.parse(data).accessToken
  })

  it('paginatedBotUsersSchema confere com POST /api/users/users-bot', async () => {
    const data = await backendFetch('/api/users/users-bot', {
      method: 'POST',
      accessToken,
      body: { page: 1, limit: 10, name: 'hayssa maria' }
    })

    const parsed = paginatedBotUsersSchema.parse(data)
    expect(parsed.data).toHaveLength(1)
    expect(parsed.data[0]).toMatchObject({ id: TEST_USER_ID, name: 'hayssa maria' })
  })

  it('botUserDetailSchema confere com GET /api/users/user-bot/:id', async () => {
    const data = await backendFetch(`/api/users/user-bot/${TEST_USER_ID}`, { accessToken })
    const parsed = botUserDetailSchema.parse(data)
    expect(parsed.id).toBe(TEST_USER_ID)
  })

  it('paginatedWithdrawalsSchema confere com POST /api/requests/withdrawal/:id (página vazia)', async () => {
    const data = await backendFetch(`/api/requests/withdrawal/${TEST_USER_ID}`, {
      method: 'POST',
      accessToken,
      body: { page: 1, limit: 5 }
    })

    const parsed = paginatedWithdrawalsSchema.parse(data)
    expect(parsed.pagination).toEqual({ page: 1, limit: 5, total: 0, totalPages: 1 })
  })

  it('extractResponseSchema confere com POST /api/requests/extract/:id', async () => {
    const data = await backendFetch(`/api/requests/extract/${TEST_USER_ID}`, { method: 'POST', accessToken, body: {} })
    const parsed = extractResponseSchema.parse(data)
    expect(parsed.balance).toBeGreaterThanOrEqual(0)
  })

  it('pendenciesResponseSchema confere com GET /api/requests/pendencies', async () => {
    const data = await backendFetch('/api/requests/pendencies', { accessToken })
    const parsed = pendenciesResponseSchema.parse(data)
    expect(parsed.map(entry => entry.requests)).toEqual(['withdrawals', 'support'])
  })

  it('networkResponseSchema confere com POST /api/network/:id', async () => {
    const data = await backendFetch(`/api/network/${TEST_USER_ID}`, {
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
