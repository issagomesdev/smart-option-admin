import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/infrastructure/http/session'
import { TeamList } from './TeamList'

export const metadata: Metadata = { title: 'Equipe' }

/**
 * Gate server-side, não só o item de menu escondido — a mesma disciplina do
 * `DashboardLayout` (`getCurrentUser()` + `redirect`), mas checando
 * `staff.manage` além de sessão válida. `/team` é um recurso "tudo ou nada"
 * (mesmo desenho do backend, `requirePermission('staff.manage')` no mount
 * inteiro de `/api/staff`), então todas as páginas deste grupo repetem esta
 * mesma checagem, cada uma independentemente.
 */
export default async function TeamPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('staff.manage')) redirect('/')

  return <TeamList />
}
