import { z } from 'zod'
import { paginatedSchema, type PaginationParams, type SortParams } from './common.dto'

/**
 * `auto` cobra na hora (checkout PIX pela Asaas); `manual` não gera cobrança — abre uma solicitação
 * de atendimento (`requests`, tipo `service`) para a equipe tratar pelo painel.
 */
export const PLAN_PURCHASE_TYPES = ['auto', 'manual'] as const
export type PlanPurchaseType = (typeof PLAN_PURCHASE_TYPES)[number]

export const PLAN_PURCHASE_TYPE_LABELS: Record<PlanPurchaseType, string> = {
  auto: 'Automático (PIX)',
  manual: 'Manual (via suporte)'
}

export const planSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  /** Percentual ao mês (ex.: 8 = 8%). Alimenta o rendimento diário real no backend. */
  earningsMonthly: z.number(),
  purchaseType: z.enum(PLAN_PURCHASE_TYPES),
  /** Plano semeado — editável, nunca excluível (`cron.ts` referencia os IDs 3/4). */
  isSystem: z.boolean(),
  isActive: z.boolean(),
  /** Quantos usuários já adquiriram — bloqueia exclusão e alimenta o aviso de impacto. */
  subscriberCount: z.number().int().nonnegative()
})

export type Plan = z.infer<typeof planSchema>

export const paginatedPlansSchema = paginatedSchema(planSchema)
export type PaginatedPlans = z.infer<typeof paginatedPlansSchema>

export interface PlanFiltersParams extends PaginationParams, SortParams {
  search?: string
  purchaseType?: PlanPurchaseType
  isActive?: boolean
}

/** `POST /api/plans` / `PATCH /api/plans/:id` — mesmo corpo para criar e editar. */
export const planInputSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório').max(255),
  description: z.string().min(1, 'Campo obrigatório'),
  price: z.number().nonnegative('Valor não pode ser negativo'),
  earningsMonthly: z
    .number()
    .nonnegative('Rentabilidade não pode ser negativa')
    .max(999.99, 'Rentabilidade mensal deve ser no máximo 999,99%'),
  purchaseType: z.enum(PLAN_PURCHASE_TYPES),
  isActive: z.boolean()
})

export type PlanInput = z.infer<typeof planInputSchema>

export const planActionResultSchema = z.object({ status: z.boolean(), message: z.string() })
export type PlanActionResult = z.infer<typeof planActionResultSchema>
