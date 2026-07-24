import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { UserForm } from '../UserForm'

export const metadata: Metadata = { title: 'Cadastrar usuário' }

export default function CreateUserPage() {
  return (
    <Card title='Cadastrar usuário' titleComponent='h1'>
      <UserForm mode='create' />
    </Card>
  )
}
