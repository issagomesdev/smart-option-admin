import {
  dashboardBalanceResponseSchema,
  dashboardUsersSchema,
  plansResponseSchema,
  type DashboardBalanceParams
} from '@/domain/dtos/dashboard.dto'
import { authorizedFetch } from '../session'

export async function getDashboardUsers() {
  const data = await authorizedFetch('/api/dashboard/users')
  return dashboardUsersSchema.parse(data)
}

export async function getDashboardBalance({ user_id, product_id, period }: DashboardBalanceParams) {
  const data = await authorizedFetch(`/api/dashboard/balance/${user_id}/${product_id}/${period}`)
  return dashboardBalanceResponseSchema.parse(data)
}

export async function getPlans() {
  const data = await authorizedFetch('/api/dashboard/plans')
  return plansResponseSchema.parse(data)
}
