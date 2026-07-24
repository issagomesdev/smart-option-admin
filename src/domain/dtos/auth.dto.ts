import { z } from 'zod'

export const loginInputSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  remember: z.boolean().optional().default(false)
})

export type LoginInput = z.infer<typeof loginInputSchema>

export const sessionUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  surname: z.string(),
  email: z.email(),
  roleId: z.number().int(),
  // `z.array(z.string())`, não `z.enum(PERMISSIONS)` — o backend é a fonte da
  // verdade do catálogo; validar contra a união aqui faria o painel quebrar
  // ao invés de só ignorar uma chave nova que ele ainda não conhece.
  // `.default([])` é defesa (fail closed), o backend já sempre manda o array.
  permissions: z.array(z.string()).default([])
})

export type SessionUser = z.infer<typeof sessionUserSchema>

/** Resposta real de `POST {backend}/api/auth` — nunca repassada ao browser como está (os tokens ficam só nos cookies httpOnly). */
export const backendLoginResponseSchema = z.object({
  auth: z.literal(true),
  accessToken: z.string(),
  refreshToken: z.string(),
  user: sessionUserSchema
})

export type BackendLoginResponse = z.infer<typeof backendLoginResponseSchema>

/** Resposta real de `POST {backend}/api/auth/refresh`. */
export const backendRefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
})

export type BackendRefreshResponse = z.infer<typeof backendRefreshResponseSchema>

/** Resposta real de `POST {backend}/api/auth/token` (validação do access token). */
export const backendTokenResponseSchema = z.object({
  user: sessionUserSchema
})

export type BackendTokenResponse = z.infer<typeof backendTokenResponseSchema>
