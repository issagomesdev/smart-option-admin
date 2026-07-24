'use server'

import {
  getExtract,
  getPendencies,
  listDeposits,
  listSubscriptions,
  listSupportRequests,
  listWithdrawals,
  markSupportAsRead,
  resolveWithdrawal
} from '@/infrastructure/http/clients/requests.client'
import { getNetwork } from '@/infrastructure/http/clients/network.client'
import type {
  ListFiltersParams,
  ResWithdrawalInput,
  SubscriptionFiltersParams,
  SupportFiltersParams
} from '@/domain/dtos/requests.dto'
import type { NetworkFiltersParams } from '@/domain/dtos/network.dto'

type UserScope = number | 'all'

export async function listWithdrawalsAction(userId: UserScope, filters: ListFiltersParams) {
  return listWithdrawals(userId, filters)
}

export async function listDepositsAction(userId: UserScope, filters: ListFiltersParams) {
  return listDeposits(userId, filters)
}

export async function listSubscriptionsAction(userId: UserScope, filters: SubscriptionFiltersParams) {
  return listSubscriptions(userId, filters)
}

export async function listSupportRequestsAction(userId: UserScope, filters: SupportFiltersParams) {
  return listSupportRequests(userId, filters)
}

export async function getExtractAction(
  userId: number,
  filters: { value?: string; origin?: string; created_at?: string }
) {
  return getExtract(userId, filters)
}

export async function getNetworkAction(userId: number, filters: NetworkFiltersParams) {
  return getNetwork(userId, filters)
}

export async function resolveWithdrawalAction(input: ResWithdrawalInput) {
  return resolveWithdrawal(input)
}

export async function markSupportAsReadAction(id: number, status: 0 | 1) {
  return markSupportAsRead(id, status)
}

export async function getPendenciesAction() {
  return getPendencies()
}
