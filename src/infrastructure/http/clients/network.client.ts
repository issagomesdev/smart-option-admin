import { networkResponseSchema, type NetworkFiltersParams } from '@/domain/dtos/network.dto'
import { authorizedFetch } from '../session'

export async function getNetwork(userId: number, filters: NetworkFiltersParams = {}) {
  const data = await authorizedFetch(`/api/network/${userId}`, { method: 'POST', body: filters })
  return networkResponseSchema.parse(data)
}
