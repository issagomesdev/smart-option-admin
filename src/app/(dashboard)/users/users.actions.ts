'use server'

import {
  createBotUser,
  deleteBotUser,
  getBotUser,
  listBotUsers,
  setBotUserActive,
  transferValues,
  updateBotUser
} from '@/infrastructure/http/clients/users.client'
import type {
  BotUsersFilters,
  CreateBotUserInput,
  TransfValuesInput,
  UpdateBotUserInput
} from '@/domain/dtos/users.dto'

export async function listBotUsersAction(filters: BotUsersFilters) {
  return listBotUsers(filters)
}

export async function getBotUserAction(id: number) {
  return getBotUser(id)
}

export async function createBotUserAction(input: CreateBotUserInput) {
  return createBotUser(input)
}

export async function updateBotUserAction(input: UpdateBotUserInput) {
  return updateBotUser(input)
}

export async function deleteBotUserAction(id: number) {
  return deleteBotUser(id)
}

export async function setBotUserActiveAction(id: number, status: 0 | 1) {
  return setBotUserActive(id, status)
}

export async function transferValuesAction(input: TransfValuesInput) {
  return transferValues(input)
}
