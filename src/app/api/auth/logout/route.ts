import { NextResponse } from 'next/server'
import { logoutSession } from '@/infrastructure/http/session'

export async function POST() {
  await logoutSession()
  return NextResponse.json({ success: true, data: { loggedOut: true } })
}
