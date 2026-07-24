import { z } from 'zod'
import { paginatedSchema, type SortParams } from './common.dto'

/** Uma linha de `POST /api/users/users-bot` (listagem paginada). */
export const botUserListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string(),
  plan: z.string(),
  telegram: z.string(),
  created_at: z.string(),
  is_active: z.boolean(),
  status: z.number().int().nullable(),
  balance: z.union([z.string(), z.number()])
})

export type BotUserListItem = z.infer<typeof botUserListItemSchema>

export const paginatedBotUsersSchema = paginatedSchema(botUserListItemSchema)
export type PaginatedBotUsers = z.infer<typeof paginatedBotUsersSchema>

/** Filtros de `POST /api/users/users-bot` — nomes de campo em snake_case porque são repassados ao backend como estão. */
export interface BotUsersFilters extends SortParams {
  user_id?: string
  name?: string
  email?: string
  product_id?: string
  status?: string
  is_active?: string
  created_at?: string
  telegram?: string
  balance?: string
  page?: number
  limit?: number
}

/** `GET /api/users/user-bot/:id` — detalhe de um usuário. */
export const botUserDetailSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().nullable(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  adress: z.string(),
  pixCode: z.string(),
  isActive: z.boolean(),
  plan: z.string(),
  telegram: z.string(),
  created_at: z.string(),
  status: z.number().int().nullable()
})

export type BotUserDetail = z.infer<typeof botUserDetailSchema>

export const updateBotUserInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.email(),
  password: z.string().min(6).optional(),
  phone_number: z.string().min(1).max(255),
  adress: z.string().min(1).max(255),
  pix_code: z.string().min(1).max(255),
  product_id: z.number().int().positive().optional()
})

export type UpdateBotUserInput = z.infer<typeof updateBotUserInputSchema>

/** `POST /api/users/user-bot` (`RegisterService.registerUser` — mesmo cadastro usado pelo bot do Telegram). */
export const createBotUserInputSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
  password: z.string().min(6),
  phone_number: z.string().min(1).max(255),
  cpf: z.string().min(1),
  adress: z.string().min(1).max(255),
  pix_code: z.string().min(1).max(255),
  balance: z.string().optional(),
  type: z.enum(['sum', 'subtract']).optional(),
  product_id: z.number().int().positive().optional()
})

export type CreateBotUserInput = z.infer<typeof createBotUserInputSchema>

export const transfValuesInputSchema = z.object({
  user_id: z.number().int().positive(),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido'),
  type: z.enum(['sum', 'subtract'])
})

export type TransfValuesInput = z.infer<typeof transfValuesInputSchema>

// Sem `id`/`userId` de propósito: o alvo destas duas rotas de self-service é
// sempre a sessão autenticada (`req.user!.id` no backend), nunca um valor
// vindo do cliente — corrigido junto com o backend (Fase 5 parte 1), que
// removeu o mesmo campo dos DTOs de lá.
export const updateStaffUserInputSchema = z.object({
  name: z.string().min(1).max(255),
  surname: z.string().min(1).max(255),
  email: z.email()
})

export type UpdateStaffUserInput = z.infer<typeof updateStaffUserInputSchema>

export const updatePassInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres')
})

export type UpdatePassInput = z.infer<typeof updatePassInputSchema>

export const staffActionResultSchema = z.object({ status: z.boolean() })
export type StaffActionResult = z.infer<typeof staffActionResultSchema>
