'use server'

import {
  createStaff,
  deleteStaff,
  getStaff,
  listStaff,
  reassignStaffRole,
  updateStaff
} from '@/infrastructure/http/clients/staff.client'
import { listRoles } from '@/infrastructure/http/clients/roles.client'
import type { CreateStaffInput, StaffFilters, UpdateStaffInput } from '@/domain/dtos/staff.dto'

export async function listStaffAction(filters: StaffFilters) {
  return listStaff(filters)
}

export async function getStaffAction(id: number) {
  return getStaff(id)
}

export async function createStaffAction(input: CreateStaffInput) {
  return createStaff(input)
}

export async function updateStaffAction(id: number, input: UpdateStaffInput) {
  return updateStaff(id, input)
}

export async function reassignStaffRoleAction(id: number, roleId: number) {
  return reassignStaffRole(id, roleId)
}

export async function deleteStaffAction(id: number) {
  return deleteStaff(id)
}

export async function listRolesAction() {
  return listRoles()
}
