import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/infrastructure/http/session'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true, data: { user } })
}
