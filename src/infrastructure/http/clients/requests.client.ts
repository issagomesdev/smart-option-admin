import {
  actionResultSchema,
  extractResponseSchema,
  paginatedDepositsSchema,
  paginatedSubscriptionsSchema,
  paginatedSupportSchema,
  paginatedWithdrawalsSchema,
  pendenciesResponseSchema,
  type ListFiltersParams,
  type ResWithdrawalInput,
  type SubscriptionFiltersParams,
  type SupportFiltersParams
} from '@/domain/dtos/requests.dto'
import { authorizedFetch } from '../session'

type UserScope = number | 'all'

export async function listWithdrawals(userId: UserScope, filters: ListFiltersParams = {}) {
  const data = await authorizedFetch(`/api/requests/withdrawal/${userId}`, { method: 'POST', body: filters })
  return paginatedWithdrawalsSchema.parse(data)
}

export async function listDeposits(userId: UserScope, filters: ListFiltersParams = {}) {
  const data = await authorizedFetch(`/api/requests/deposit/${userId}`, { method: 'POST', body: filters })
  return paginatedDepositsSchema.parse(data)
}

export async function listSubscriptions(userId: UserScope, filters: SubscriptionFiltersParams = {}) {
  const data = await authorizedFetch(`/api/requests/subscription/${userId}`, { method: 'POST', body: filters })
  return paginatedSubscriptionsSchema.parse(data)
}

export async function listSupportRequests(userId: UserScope, filters: SupportFiltersParams = {}) {
  const data = await authorizedFetch(`/api/requests/support/${userId}`, { method: 'POST', body: filters })
  return paginatedSupportSchema.parse(data)
}

export async function getExtract(
  userId: UserScope,
  filters: { value?: string; origin?: string; created_at?: string } = {}
) {
  const data = await authorizedFetch(`/api/requests/extract/${userId}`, { method: 'POST', body: filters })
  return extractResponseSchema.parse(data)
}

export async function resolveWithdrawal(input: ResWithdrawalInput) {
  const data = await authorizedFetch('/api/requests/res-withdrawal', { method: 'POST', body: input })
  return actionResultSchema.parse(data)
}

export async function markSupportAsRead(id: number, status: 0 | 1) {
  return authorizedFetch(`/api/requests/was-read/${id}/${status}`, { method: 'PATCH' })
}

export async function getPendencies() {
  const data = await authorizedFetch('/api/requests/pendencies')
  return pendenciesResponseSchema.parse(data)
}
