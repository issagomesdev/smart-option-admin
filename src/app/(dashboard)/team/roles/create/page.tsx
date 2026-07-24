import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { getCurrentUser } from '@/infrastructure/http/session'
import { RoleForm } from '../RoleForm'

export const metadata: Metadata = { title: 'Cadastrar papel' }

export default async function CreateRolePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('roles.manage')) redirect('/')

  return (
    <Card title='Cadastrar papel' titleComponent='h1'>
      <RoleForm mode='create' />
    </Card>
  )
}
