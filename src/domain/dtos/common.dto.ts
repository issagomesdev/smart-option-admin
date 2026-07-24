import { z } from 'zod'

/** Envelope padrão de sucesso do backend (`shared/http/response.ts#ok`). */
export interface ApiSuccess<T> {
  success: true
  data: T
}

/** Envelope padrão de erro do backend (`shared/http/response.ts#fail`). */
export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  requestId?: string
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive()
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    pagination: paginationMetaSchema
  })
}

export interface PaginationParams {
  page?: number
  limit?: number
}

/** Espelha `shared/http/sorting.ts#SortParams` do backend — a allowlist de colunas aceitas é validada lá, não aqui. */
export interface SortParams {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}
