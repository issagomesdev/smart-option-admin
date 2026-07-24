import {
  paginatedStaffSchema,
  staffActionResultSchema,
  staffDetailSchema,
  type CreateStaffInput,
  type StaffFilters
} from '@/domain/dtos/staff.dto'
import { authorizedFetch } from '../session'

export async function listStaff(filters: StaffFilters = {}) {
  const query = new URLSearchParams()
  if (filters.page) query.set('page', String(filters.page))
  if (filters.limit) query.set('limit', String(filters.limit))
  if (filters.sortBy) query.set('sortBy', filters.sortBy)
  if (filters.sortDirection) query.set('sortDirection', filters.sortDirection)
  const qs = query.toString()

  const data = await authorizedFetch(`/api/staff${qs ? `?${qs}` : ''}`)
  return paginatedStaffSchema.parse(data)
}

export async function getStaff(id: number) {
  const data = await authorizedFetch(`/api/staff/${id}`)
  return staffDetailSchema.parse(data)
}

export async function createStaff(input: CreateStaffInput) {
  const data = await authorizedFetch('/api/staff', { method: 'POST', body: input })
  return staffDetailSchema.parse(data)
}

export async function reassignStaffRole(id: number, roleId: number) {
  const data = await authorizedFetch(`/api/staff/${id}/role`, { method: 'PATCH', body: { roleId } })
  return staffDetailSchema.parse(data)
}

export async function deactivateStaff(id: number) {
  const data = await authorizedFetch(`/api/staff/${id}`, { method: 'DELETE' })
  return staffActionResultSchema.parse(data)
}
