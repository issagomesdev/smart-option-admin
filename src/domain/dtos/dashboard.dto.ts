import { z } from 'zod'

export const periodKindSchema = z.enum(['all', 'today', '7d', '30d', 'custom'])
export type PeriodKind = z.infer<typeof periodKindSchema>

export interface DashboardFilters {
  period: PeriodKind
  start?: string
  end?: string
  userId?: number
  productId?: number
}

const kpiValueSchema = z.object({
  value: z.number(),
  previousValue: z.number(),
  /** Pontos percentuais quando `changeType: 'percentage'`, delta bruto quando `'absolute'`. */
  change: z.number(),
  changeType: z.enum(['percentage', 'absolute'])
})
export type KpiValue = z.infer<typeof kpiValueSchema>

const pendingWithdrawalsKpiSchema = kpiValueSchema.extend({
  /** Total de saques pendentes agora (sem filtro de data) — `value`/`previousValue` são escopados ao período. */
  currentBacklog: z.number().int().nonnegative()
})
export type PendingWithdrawalsKpi = z.infer<typeof pendingWithdrawalsKpiSchema>

export const dashboardKpisSchema = z.object({
  activeUsers: kpiValueSchema,
  networkBalance: kpiValueSchema,
  deposits: kpiValueSchema,
  pendingWithdrawals: pendingWithdrawalsKpiSchema
})
export type DashboardKpis = z.infer<typeof dashboardKpisSchema>

const chartPointSchema = z.object({ bucket: z.string(), total: z.number() })
export type ChartPoint = z.infer<typeof chartPointSchema>

export const rentabilidadeChartSchema = z.object({
  granularity: z.enum(['day', 'month']),
  points: z.array(chartPointSchema)
})

export const approvedTodaySchema = z.object({
  count: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  /** `null` quando `total=0` (nada criado ainda hoje) — renderiza "—", nunca "0%" enganoso. */
  percent: z.number().nullable()
})

export const movementSourceSchema = z.enum(['wallet_transaction', 'withdrawal', 'checkout'])
export type MovementSource = z.infer<typeof movementSourceSchema>

export const movementRowSchema = z.object({
  id: z.string(),
  source: movementSourceSchema,
  kind: z.string(),
  direction: z.enum(['credit', 'debit']),
  amount: z.number(),
  status: z.string(),
  userId: z.number(),
  userName: z.string(),
  referenceId: z.string().nullable(),
  createdAt: z.string()
})
export type MovementRow = z.infer<typeof movementRowSchema>

export const dashboardSummarySchema = z.object({
  kpis: dashboardKpisSchema,
  chart: rentabilidadeChartSchema,
  approvedToday: approvedTodaySchema,
  recentMovements: z.array(movementRowSchema)
})
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>

// --- Mantido intacto: consumido também por SubscriptionsTable, users/page.tsx e UserForm. ---
export const planSchema = z.object({
  id: z.number().int().positive(),
  name: z.string()
})

export type Plan = z.infer<typeof planSchema>
export const plansResponseSchema = z.array(planSchema)
