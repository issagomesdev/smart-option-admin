import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BackendApiError } from '@/infrastructure/http/backend-client'
import { getCurrentUser } from '@/infrastructure/http/session'
import { getPlanAction } from '../../plans.actions'
import { PlanForm } from '../../PlanForm'

export const metadata: Metadata = { title: 'Editar plano' }

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('plans.manage')) redirect('/')

  const { id } = await params
  const planId = Number(id)

  const plan = await getPlanAction(planId).catch((error: unknown) => {
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
  })

  if (!plan) notFound()

  return (
    <Card title={`Editar plano — ${plan.name}`} titleComponent='h1'>
      <PlanForm mode='edit' planId={planId} initialValues={plan} />
    </Card>
  )
}
