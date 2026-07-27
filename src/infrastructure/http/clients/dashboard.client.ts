import { dashboardSummarySchema, plansResponseSchema, type DashboardFilters } from '@/domain/dtos/dashboard.dto'
import { authorizedFetch } from '../session'

/** `GET` + query string (não corpo) — o único filtro deste recurso é o período/recorte, cabe numa URL. */
function toQueryString(filters: DashboardFilters): string {
  const params = new URLSearchParams({ period: filters.period })
  if (filters.start) params.set('start', filters.start)
  if (filters.end) params.set('end', filters.end)
  if (filters.userId) params.set('userId', String(filters.userId))
  if (filters.productId) params.set('productId', String(filters.productId))
  return params.toString()
}

export async function getDashboardSummary(filters: DashboardFilters) {
  const data = await authorizedFetch(`/api/dashboard/summary?${toQueryString(filters)}`)
  return dashboardSummarySchema.parse(data)
}

export async function getPlans() {
  const data = await authorizedFetch('/api/dashboard/plans')
  return plansResponseSchema.parse(data)
}
