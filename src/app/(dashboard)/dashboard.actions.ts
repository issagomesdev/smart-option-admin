'use server'

import { getDashboardSummary, getPlans } from '@/infrastructure/http/clients/dashboard.client'
import { listBotUsers } from '@/infrastructure/http/clients/users.client'
import type { DashboardFilters } from '@/domain/dtos/dashboard.dto'

/**
 * Server Actions — a ponte entre os Client Components interativos (filtros
 * do Dashboard) e os clients server-only da Fase 2 (`authorizedFetch` usa
 * `next/headers`, que não pode rodar no browser). Preferidas a Route
 * Handlers manuais aqui: são chamadas como função direta do componente,
 * sem reimplementar `fetch`/parse de JSON no lado do cliente.
 */
export async function getDashboardSummaryAction(filters: DashboardFilters) {
  return getDashboardSummary(filters)
}

export async function getPlansAction() {
  return getPlans()
}

export async function searchBotUsersAction(search: string) {
  const result = await listBotUsers({ name: search, limit: 50 })
  return result.data
}
