import { z } from 'zod'

export const roleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
  isSystem: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Role = z.infer<typeof roleSchema>

export const rolesListSchema = z.array(roleSchema)

/** `POST /api/roles` / `PATCH /api/roles/:id` — mesmo corpo para criar e editar. */
export const roleInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string())
})

export type RoleInput = z.infer<typeof roleInputSchema>

export const roleActionResultSchema = z.object({ status: z.boolean(), message: z.string() })
export type RoleActionResult = z.infer<typeof roleActionResultSchema>
