'use server'

import { createRole, deleteRole, getRole, listRoles, updateRole } from '@/infrastructure/http/clients/roles.client'
import type { RoleInput } from '@/domain/dtos/roles.dto'

export async function listRolesAction() {
  return listRoles()
}

export async function getRoleAction(id: number) {
  return getRole(id)
}

export async function createRoleAction(input: RoleInput) {
  return createRole(input)
}

export async function updateRoleAction(id: number, input: RoleInput) {
  return updateRole(id, input)
}

export async function deleteRoleAction(id: number) {
  return deleteRole(id)
}
