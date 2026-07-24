import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shell/DashboardShell'
import { getCurrentUser } from '@/infrastructure/http/session'

/**
 * Gate de autenticação de verdade para todas as rotas deste grupo — o
 * middleware (checagem barata, só cookie) é a primeira linha de defesa,
 * este layout é quem decide de fato (chama `/api/auth/token` no backend via
 * `getCurrentUser`, renovando o access token se necessário).
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
