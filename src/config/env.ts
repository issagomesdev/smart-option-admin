import { z } from 'zod'

export const envSchema = z.object({
  // Sem prefixo NEXT_PUBLIC_ de propósito (renomeado na Fase 7): só é lida
  // dentro de `backend-client.ts`, que roda exclusivamente em Route
  // Handlers/Server Components (nunca bundlado para o browser) — o nome
  // antigo era resíduo de antes do BFF (Fase 2), quando o cliente HTTP
  // ainda rodava no navegador.
  BASE_URL: z.url({ message: 'BASE_URL deve ser uma URL válida' })
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse({
    BASE_URL: process.env.BASE_URL
  })

  if (!result.success) {
    const issues = result.error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n')
    const message = `Configuração de ambiente inválida:\n${issues}`

    // No servidor (build/dev/SSR) falha rápido. No browser `process.exit` não
    // existe — lança para aparecer alto e visível no console, em vez de
    // deixar `env.BASE_URL` como `undefined` silencioso em runtime.
    if (typeof window === 'undefined') {
      console.error(message)
      process.exit(1)
    }

    throw new Error(message)
  }

  return result.data
}

export const env = loadEnv()
