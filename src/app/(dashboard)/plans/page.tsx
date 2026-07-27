import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/infrastructure/http/session'
import { PlansList } from './PlansList'

export const metadata: Metadata = { title: 'Planos' }

/** Mesma disciplina de `/team` e `/team/roles`: gate server-side repetido em cada página, não um layout do grupo. */
export default async function PlansPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('plans.manage')) redirect('/')

  return <PlansList />
}
