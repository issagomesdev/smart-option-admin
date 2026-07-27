import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { getCurrentUser } from '@/infrastructure/http/session'
import { PlanForm } from '../PlanForm'

export const metadata: Metadata = { title: 'Novo plano' }

export default async function CreatePlanPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('plans.manage')) redirect('/')

  return (
    <Card title='Novo plano' titleComponent='h1'>
      <PlanForm mode='create' />
    </Card>
  )
}
