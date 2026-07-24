import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BackendApiError } from '@/infrastructure/http/backend-client'
import { getBotUserAction } from '../../users.actions'
import { UserForm } from '../../UserForm'

export const metadata: Metadata = { title: 'Editar usuário' }

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = Number(id)

  const user = await getBotUserAction(userId).catch((error: unknown) => {
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
  })

  if (!user) notFound()

  return (
    <Card title={`Editar usuário — ${user.name}`} titleComponent='h1'>
      <UserForm mode='edit' userId={userId} initialValues={user} />
    </Card>
  )
}
