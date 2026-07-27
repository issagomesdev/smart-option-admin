import {
  paginatedPlansSchema,
  planActionResultSchema,
  planSchema,
  type PlanFiltersParams,
  type PlanInput
} from '@/domain/dtos/plans.dto'
import { authorizedFetch } from '../session'

/** `GET /api/plans` recebe os filtros por query string (o backend valida com `planFiltersDto`). */
function toQueryString(filters: PlanFiltersParams): string {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortDirection) params.set('sortDirection', filters.sortDirection)
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.purchaseType) params.set('purchaseType', filters.purchaseType)
  // Só envia quando definido: ausente = "todos", `false` = "só inativos" (um `if` truthy comeria o false).
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listPlans(filters: PlanFiltersParams = {}) {
  const data = await authorizedFetch(`/api/plans${toQueryString(filters)}`)
  return paginatedPlansSchema.parse(data)
}

export async function getPlan(id: number) {
  const data = await authorizedFetch(`/api/plans/${id}`)
  return planSchema.parse(data)
}

export async function createPlan(input: PlanInput) {
  const data = await authorizedFetch('/api/plans', { method: 'POST', body: input })
  return planSchema.parse(data)
}

export async function updatePlan(id: number, input: PlanInput) {
  const data = await authorizedFetch(`/api/plans/${id}`, { method: 'PATCH', body: input })
  return planSchema.parse(data)
}

export async function deletePlan(id: number) {
  const data = await authorizedFetch(`/api/plans/${id}`, { method: 'DELETE' })
  return planActionResultSchema.parse(data)
}
