import { NextResponse } from 'next/server'

/** Usado pelo HEALTHCHECK do Dockerfile — só confirma que o processo Next.js está de pé, sem depender do backend (evita flapping em cascata se o backend reiniciar). */
export async function GET() {
  return NextResponse.json({ success: true, data: { status: 'ok' } })
}
