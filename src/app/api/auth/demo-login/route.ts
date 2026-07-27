import { NextResponse } from 'next/server'
import { errorResponse } from '@/infrastructure/http/api-response'
import { demoLoginWithBackend } from '@/infrastructure/http/session'

/**
 * Login de visitante do modo demonstração. Sem corpo e sem validação: não há nada que o cliente
 * informe — a sessão inteira é decidida pelo backend.
 *
 * Se o backend estiver com `APP_DEMO=false`, ele responde 404 e `errorResponse` repassa esse
 * mesmo 404 ao browser. É isso que faz o botão "Entrar como visitante" ser inofensivo mesmo que
 * alguém force a chamada num ambiente que não é de demonstração.
 */
export async function POST() {
  try {
    const user = await demoLoginWithBackend()
    return NextResponse.json({ success: true, data: { user } })
  } catch (error) {
    return errorResponse(error)
  }
}
