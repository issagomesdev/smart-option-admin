import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/infrastructure/http/session'
import { RolesList } from './RolesList'

export const metadata: Metadata = { title: 'Papéis' }

/** Mesma disciplina de `/team`: gate server-side repetido em cada página, não um layout compartilhado do grupo. */
export default async function RolesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('roles.manage')) redirect('/')

  return <RolesList />
}
