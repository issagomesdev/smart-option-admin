import { describe, expect, it } from 'vitest'
import { envSchema } from './env'

describe('schema de variáveis de ambiente', () => {
  it('aceita uma BASE_URL válida', () => {
    const result = envSchema.safeParse({ BASE_URL: 'http://localhost:3000' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.BASE_URL).toBe('http://localhost:3000')
    }
  })

  it('rejeita quando BASE_URL está ausente', () => {
    const result = envSchema.safeParse({})

    expect(result.success).toBe(false)
  })

  it('rejeita quando BASE_URL não é uma URL válida', () => {
    const result = envSchema.safeParse({ BASE_URL: 'não-é-uma-url' })

    expect(result.success).toBe(false)
  })
})
