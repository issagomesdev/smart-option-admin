'use client'

import { useState, type SyntheticEvent } from 'react'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import { AccountForm } from './AccountForm'
import { SecurityForm } from './SecurityForm'

type TabValue = 'account' | 'security'

export interface AccountSettingsTabsProps {
  user: SessionUser
}

export function AccountSettingsTabs({ user }: AccountSettingsTabsProps) {
  const [tab, setTab] = useState<TabValue>('account')

  function handleChange(_event: SyntheticEvent, value: TabValue) {
    setTab(value)
  }

  return (
    <>
      <Tabs value={tab} onChange={handleChange}>
        <Tab value='account' label='Conta' />
        <Tab value='security' label='Segurança' />
      </Tabs>

      {tab === 'account' && <AccountForm user={user} />}
      {tab === 'security' && <SecurityForm />}
    </>
  )
}
