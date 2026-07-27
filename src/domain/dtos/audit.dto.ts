import { z } from 'zod'
import { paginatedSchema, type SortParams } from './common.dto'
import { movementSourceSchema } from './dashboard.dto'

export const AUDIT_TYPES = [
  'deposit',
  'withdrawal',
  'earnings',
  'profitability',
  'subscription',
  'tuition',
  'transfer_in',
  'transfer_out',
  'admin_adjustment',
  'diamond_tax'
] as const
export type AuditType = (typeof AUDIT_TYPES)[number]

export interface AuditFiltersParams extends SortParams {
  page?: number
  limit?: number
  period?: 'today' | '7d' | '30d' | 'custom'
  start?: string
  end?: string
  type?: AuditType
  /** Simplificado pro backend em duas categorias (`completed`/`pending`) — o status bruto de cada linha continua vindo em `status`. */
  status?: 'completed' | 'pending'
  userId?: number
  minValue?: number
  maxValue?: number
  search?: string
}

export const auditMovementItemSchema = z.object({
  id: z.string(),
  source: movementSourceSchema,
  kind: z.string(),
  direction: z.enum(['credit', 'debit']),
  amount: z.number(),
  status: z.string(),
  gateway: z.enum(['Asaas (PIX)', 'Sistema']),
  userId: z.number(),
  userName: z.string(),
  telegramUserId: z.string().nullable(),
  referenceId: z.string().nullable(),
  responsibleAdmin: z.string().nullable(),
  observations: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type AuditMovementItem = z.infer<typeof auditMovementItemSchema>
export const paginatedAuditSchema = paginatedSchema(auditMovementItemSchema)
export type PaginatedAudit = z.infer<typeof paginatedAuditSchema>
