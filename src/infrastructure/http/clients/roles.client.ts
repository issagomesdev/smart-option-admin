import { roleActionResultSchema, roleSchema, rolesListSchema, type RoleInput } from '@/domain/dtos/roles.dto'
import { authorizedFetch } from '../session'

export async function listRoles() {
  const data = await authorizedFetch('/api/roles')
  return rolesListSchema.parse(data)
}

export async function getRole(id: number) {
  const data = await authorizedFetch(`/api/roles/${id}`)
  return roleSchema.parse(data)
}

export async function createRole(input: RoleInput) {
  const data = await authorizedFetch('/api/roles', { method: 'POST', body: input })
  return roleSchema.parse(data)
}

export async function updateRole(id: number, input: RoleInput) {
  const data = await authorizedFetch(`/api/roles/${id}`, { method: 'PATCH', body: input })
  return roleSchema.parse(data)
}

export async function deleteRole(id: number) {
  const data = await authorizedFetch(`/api/roles/${id}`, { method: 'DELETE' })
  return roleActionResultSchema.parse(data)
}
