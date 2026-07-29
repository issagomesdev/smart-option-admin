import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BackendApiError } from '@/infrastructure/http/backend-client'
import { getCurrentUser } from '@/infrastructure/http/session'
import { getStaffAction } from '../../team.actions'
import { TeamForm } from '../../TeamForm'

export const metadata: Metadata = { title: 'Editar colaborador do staff' }

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('staff.manage')) redirect('/')

  const { id } = await params
  const staffId = Number(id)

  const staff = await getStaffAction(staffId).catch((error: unknown) => {
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
  })

  if (!staff) notFound()

  return (
    <Card title={`Editar colaborador — ${staff.name} ${staff.surname}`} titleComponent='h1'>
      <TeamForm mode='edit' staffId={staffId} initialValues={staff} />
    </Card>
  )
}
