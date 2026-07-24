import { z } from 'zod'
import { paginatedSchema, type SortParams } from './common.dto'

export interface ListFiltersParams extends SortParams {
  id?: string
  name?: string
  value?: string
  status?: string
  created_at?: string
  page?: number
  limit?: number
}

export interface SubscriptionFiltersParams extends ListFiltersParams {
  product_id?: string
}

export interface SupportFiltersParams extends SortParams {
  id?: string
  name?: string
  type?: string
  is_read?: string
  created_at?: string
  page?: number
  limit?: number
}

export const withdrawalStatusSchema = z.enum(['pending', 'authorized', 'refused', 'failed', 'success'])
export type WithdrawalStatus = z.infer<typeof withdrawalStatusSchema>

export const withdrawalItemSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  value: z.string(),
  status: withdrawalStatusSchema,
  reply_observation: z.string().nullable(),
  errors_cause: z.string().nullable(),
  reference_id: z.string(),
  transaction_id: z.string().nullable(),
  created_at: z.string(),
  name: z.string()
})

export type WithdrawalItem = z.infer<typeof withdrawalItemSchema>
export const paginatedWithdrawalsSchema = paginatedSchema(withdrawalItemSchema)
export type PaginatedWithdrawals = z.infer<typeof paginatedWithdrawalsSchema>

export const checkoutStatusSchema = z.enum(['PENDING', 'AUTHORIZED', 'PAID', 'IN_ANALYSIS', 'DECLINED', 'CANCELED'])
export type CheckoutStatus = z.infer<typeof checkoutStatusSchema>

export const depositItemSchema = z.object({
  id: z.number().int().positive(),
  reference_id: z.string(),
  type: z.literal('deposit'),
  value: z.string(),
  status: checkoutStatusSchema,
  transaction_id: z.string().nullable(),
  user_id: z.number().int().positive().nullable(),
  created_at: z.string(),
  name: z.string()
})

export type DepositItem = z.infer<typeof depositItemSchema>
export const paginatedDepositsSchema = paginatedSchema(depositItemSchema)
export type PaginatedDeposits = z.infer<typeof paginatedDepositsSchema>

export const subscriptionItemSchema = depositItemSchema.extend({
  type: z.literal('subscription'),
  product: z.string().nullable()
})

export type SubscriptionItem = z.infer<typeof subscriptionItemSchema>
export const paginatedSubscriptionsSchema = paginatedSchema(subscriptionItemSchema)
export type PaginatedSubscriptions = z.infer<typeof paginatedSubscriptionsSchema>

export const supportItemSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(['support', 'service']),
  subject: z.string(),
  is_read: z.number().int(),
  user_id: z.number().int().positive(),
  created_at: z.string(),
  name: z.string()
})

export type SupportItem = z.infer<typeof supportItemSchema>
export const paginatedSupportSchema = paginatedSchema(supportItemSchema)
export type PaginatedSupport = z.infer<typeof paginatedSupportSchema>

export const extractItemSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(['sum', 'subtract']),
  value: z.string(),
  origin: z.string(),
  reference_id: z.string().nullable(),
  created_at: z.string()
})

export type ExtractItem = z.infer<typeof extractItemSchema>

export const extractResponseSchema = z.object({
  extract: z.array(extractItemSchema),
  balance: z.number()
})

export type ExtractResponse = z.infer<typeof extractResponseSchema>

export const resWithdrawalInputSchema = z.object({
  res: z.boolean(),
  id: z.number().int().positive(),
  observation: z.string().optional()
})

export type ResWithdrawalInput = z.infer<typeof resWithdrawalInputSchema>

export const actionResultSchema = z.object({
  status: z.boolean(),
  message: z.string()
})

export type ActionResult = z.infer<typeof actionResultSchema>

export const pendencyItemSchema = z.object({
  requests: z.string(),
  pendings: z.number().int().nonnegative()
})

export const pendenciesResponseSchema = z.array(pendencyItemSchema)
export type PendenciesResponse = z.infer<typeof pendenciesResponseSchema>
