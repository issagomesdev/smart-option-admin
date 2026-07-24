import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { getCurrentUser } from '@/infrastructure/http/session'
import { TeamForm } from '../TeamForm'

export const metadata: Metadata = { title: 'Cadastrar staff' }

export default async function CreateStaffPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.permissions.includes('staff.manage')) redirect('/')

  return (
    <Card title='Cadastrar staff' titleComponent='h1'>
      <TeamForm mode='create' />
    </Card>
  )
}
