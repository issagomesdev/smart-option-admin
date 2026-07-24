'use client'

import { useState, type SyntheticEvent } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { DepositsTable } from '../requests/DepositsTable'
import { ExtractTable } from '../requests/ExtractTable'
import { NetworkTable } from '../requests/NetworkTable'
import { SubscriptionsTable } from '../requests/SubscriptionsTable'
import { SupportTable } from '../requests/SupportTable'
import { WithdrawalsTable } from '../requests/WithdrawalsTable'

type TabValue = 'extract' | 'network' | 'withdrawals' | 'deposits' | 'support' | 'subscriptions'

export interface UserRequestsTabsProps {
  userId: number
}

export function UserRequestsTabs({ userId }: UserRequestsTabsProps) {
  const [tab, setTab] = useState<TabValue>('extract')

  function handleChange(_event: SyntheticEvent, value: TabValue) {
    setTab(value)
  }

  return (
    <Box>
      <Tabs value={tab} onChange={handleChange} variant='scrollable' scrollButtons='auto' sx={{ mb: 3 }}>
        <Tab value='extract' label='Extrato' />
        <Tab value='network' label='Rede' />
        <Tab value='withdrawals' label='Saques' />
        <Tab value='deposits' label='Depósitos' />
        <Tab value='support' label='Suporte' />
        <Tab value='subscriptions' label='Adesões' />
      </Tabs>

      {tab === 'extract' && <ExtractTable userId={userId} />}
      {tab === 'network' && <NetworkTable userId={userId} />}
      {tab === 'withdrawals' && <WithdrawalsTable userId={userId} />}
      {tab === 'deposits' && <DepositsTable userId={userId} />}
      {tab === 'support' && <SupportTable userId={userId} />}
      {tab === 'subscriptions' && <SubscriptionsTable userId={userId} />}
    </Box>
  )
}
