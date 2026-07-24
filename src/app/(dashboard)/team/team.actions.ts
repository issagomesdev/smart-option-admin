'use server'

import {
  createStaff,
  deactivateStaff,
  getStaff,
  listStaff,
  reassignStaffRole
} from '@/infrastructure/http/clients/staff.client'
import { listRoles } from '@/infrastructure/http/clients/roles.client'
import type { CreateStaffInput, StaffFilters } from '@/domain/dtos/staff.dto'

export async function listStaffAction(filters: StaffFilters) {
  return listStaff(filters)
}

export async function getStaffAction(id: number) {
  return getStaff(id)
}

export async function createStaffAction(input: CreateStaffInput) {
  return createStaff(input)
}

export async function reassignStaffRoleAction(id: number, roleId: number) {
  return reassignStaffRole(id, roleId)
}

export async function deactivateStaffAction(id: number) {
  return deactivateStaff(id)
}

export async function listRolesAction() {
  return listRoles()
}
