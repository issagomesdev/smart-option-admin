import { NextResponse } from 'next/server'
import { BackendApiError } from './backend-client'

/** Mapeia um erro do backend para uma resposta no mesmo formato de envelope — re-lança qualquer outro erro para o handler de erro padrão do Next.js. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof BackendApiError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.status }
    )
  }

  throw error
}
