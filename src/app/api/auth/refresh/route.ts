import { NextResponse } from 'next/server'
import { refreshSession } from '@/infrastructure/http/session'

export async function POST() {
  const refreshed = await refreshSession()

  if (!refreshed) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Sessão expirada' } },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true, data: { refreshed: true } })
}
