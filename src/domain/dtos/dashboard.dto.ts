import { z } from 'zod'

export const dashboardUsersSchema = z.object({
  allUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  bronzeUsers: z.number().int().nonnegative(),
  silverUsers: z.number().int().nonnegative(),
  goldUsers: z.number().int().nonnegative(),
  diamondUsers: z.number().int().nonnegative()
})

export type DashboardUsers = z.infer<typeof dashboardUsersSchema>

export const dashboardBalanceEntrySchema = z.object({
  name: z.string(),
  value: z.number()
})

export const dashboardBalanceResponseSchema = z.array(dashboardBalanceEntrySchema)
export type DashboardBalanceResponse = z.infer<typeof dashboardBalanceResponseSchema>

export const dashboardBalanceParamsSchema = z.object({
  user_id: z.string(),
  product_id: z.string(),
  period: z.string()
})

export type DashboardBalanceParams = z.infer<typeof dashboardBalanceParamsSchema>

export const planSchema = z.object({
  id: z.number().int().positive(),
  name: z.string()
})

export type Plan = z.infer<typeof planSchema>
export const plansResponseSchema = z.array(planSchema)
