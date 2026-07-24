import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BackendApiError } from '@/infrastructure/http/backend-client'
import { getCurrentUser } from '@/infrastructure/http/session'
import { getRoleAction } from '../../roles.actions'
import { RoleForm } from '../../RoleForm'

export const metadata: Metadata = { title: 'Editar papel' }

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('roles.manage')) redirect('/')

  const { id } = await params
  const roleId = Number(id)

  const role = await getRoleAction(roleId).catch((error: unknown) => {
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
  })

  if (!role) notFound()

  return (
    <Card title={`Editar papel — ${role.name}`} titleComponent='h1'>
      <RoleForm mode='edit' roleId={roleId} initialValues={role} />
    </Card>
  )
}
