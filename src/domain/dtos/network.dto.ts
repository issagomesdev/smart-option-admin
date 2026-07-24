import { z } from 'zod'
import { paginatedSchema, type SortParams } from './common.dto'

export interface NetworkFiltersParams extends SortParams {
  id?: string
  name?: string
  level?: string
  status?: string
  page?: number
  limit?: number
}

export const networkMemberSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  level: z.enum(['1', '2', '3']),
  status: z.number().int()
})

export type NetworkMember = z.infer<typeof networkMemberSchema>

export const paginatedNetworkMembersSchema = paginatedSchema(networkMemberSchema)

export const networkResponseSchema = z.object({
  guests: paginatedNetworkMembersSchema,
  affiliates: paginatedNetworkMembersSchema
})

export type NetworkResponse = z.infer<typeof networkResponseSchema>
