import { NextRequest, NextResponse } from 'next/server'
import { loginInputSchema } from '@/domain/dtos/auth.dto'
import { errorResponse } from '@/infrastructure/http/api-response'
import { loginWithBackend } from '@/infrastructure/http/session'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = loginInputSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dados de login inválidos', details: parsed.error.issues }
      },
      { status: 400 }
    )
  }

  try {
    // O token nunca volta no corpo da resposta — só nos cookies httpOnly
    // (setados dentro de `loginWithBackend`). O browser só recebe o usuário.
    const user = await loginWithBackend(parsed.data)
    return NextResponse.json({ success: true, data: { user } })
  } catch (error) {
    return errorResponse(error)
  }
}
