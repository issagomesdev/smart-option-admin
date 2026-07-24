import {
  botUserDetailSchema,
  paginatedBotUsersSchema,
  staffActionResultSchema,
  type BotUsersFilters,
  type CreateBotUserInput,
  type TransfValuesInput,
  type UpdateBotUserInput,
  type UpdatePassInput,
  type UpdateStaffUserInput
} from '@/domain/dtos/users.dto'
import { authorizedFetch } from '../session'

export async function listBotUsers(filters: BotUsersFilters = {}) {
  const data = await authorizedFetch('/api/users/users-bot', { method: 'POST', body: filters })
  return paginatedBotUsersSchema.parse(data)
}

export async function getBotUser(id: number) {
  const data = await authorizedFetch(`/api/users/user-bot/${id}`)
  return botUserDetailSchema.parse(data)
}

export async function createBotUser(input: CreateBotUserInput) {
  return authorizedFetch('/api/users/user-bot', { method: 'POST', body: input })
}

export async function updateBotUser(input: UpdateBotUserInput) {
  return authorizedFetch('/api/users/user-bot', { method: 'PATCH', body: input })
}

export async function deleteBotUser(id: number) {
  return authorizedFetch(`/api/users/user-bot/${id}`, { method: 'DELETE' })
}

export async function setBotUserActive(id: number, status: 0 | 1) {
  return authorizedFetch(`/api/users/user-bot/${id}/${status}`, { method: 'PUT' })
}

export async function transferValues(input: TransfValuesInput) {
  return authorizedFetch('/api/users/transf-user-admin', { method: 'POST', body: input })
}

export async function updateStaffUser(input: UpdateStaffUserInput) {
  const data = await authorizedFetch('/api/users/update-user', { method: 'PATCH', body: input })
  return staffActionResultSchema.parse(data)
}

export async function updateStaffPassword(input: UpdatePassInput) {
  const data = await authorizedFetch('/api/users/update-pass', { method: 'PATCH', body: input })
  return staffActionResultSchema.parse(data)
}
