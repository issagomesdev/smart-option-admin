import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { getCurrentUser } from '@/infrastructure/http/session'
import { AccountSettingsTabs } from './AccountSettingsTabs'

export const metadata: Metadata = { title: 'Configurações da conta' }

export default async function AccountSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <Card title='Configurações da conta' titleComponent='h1'>
      <AccountSettingsTabs user={user} />
    </Card>
  )
}
