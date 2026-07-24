'use server'

import { updateStaffPassword, updateStaffUser } from '@/infrastructure/http/clients/users.client'
import type { UpdatePassInput, UpdateStaffUserInput } from '@/domain/dtos/users.dto'

export async function updateStaffUserAction(input: UpdateStaffUserInput) {
  return updateStaffUser(input)
}

export async function updateStaffPasswordAction(input: UpdatePassInput) {
  return updateStaffPassword(input)
}
