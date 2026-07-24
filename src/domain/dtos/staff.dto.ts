import { z } from 'zod'
import { paginatedSchema, type SortParams } from './common.dto'

/**
 * Uma linha de `GET /api/staff`. `isActive` vem como `0`/`1` (não
 * `true`/`false`) — a coluna é calculada via `deletedAt IS NULL` numa
 * expressão SQL crua no backend (`sql<number>`), não uma coluna `boolean`
 * de verdade (essas o driver mysql2 converte; expressões cruas, não).
 */
export const staffListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  surname: z.string(),
  email: z.string(),
  roleId: z.number().int().positive(),
  roleName: z.string(),
  isActive: z.union([z.literal(0), z.literal(1)]),
  createdAt: z.string()
})

export type StaffListItem = z.infer<typeof staffListItemSchema>

export const paginatedStaffSchema = paginatedSchema(staffListItemSchema)
export type PaginatedStaff = z.infer<typeof paginatedStaffSchema>

export interface StaffFilters extends SortParams {
  page?: number
  limit?: number
}

/** `POST /api/staff` — sem fluxo de convite por e-mail, o admin define a senha direto na criação (mesmo padrão de bot users). */
export const createStaffInputSchema = z.object({
  name: z.string().min(1).max(255),
  surname: z.string().min(1).max(255),
  email: z.email(),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  roleId: z.number().int().positive()
})

export type CreateStaffInput = z.infer<typeof createStaffInputSchema>

export const staffDetailSchema = staffListItemSchema
export type StaffDetail = StaffListItem

export const staffActionResultSchema = z.object({ status: z.boolean(), message: z.string() })
export type StaffActionResult = z.infer<typeof staffActionResultSchema>
