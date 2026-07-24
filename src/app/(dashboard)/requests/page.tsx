'use client'

import { useEffect, useState, type SyntheticEvent } from 'react'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { Card } from '@/components/ui/Card'
import { DepositsTable } from './DepositsTable'
import { SubscriptionsTable } from './SubscriptionsTable'
import { SupportTable } from './SupportTable'
import { WithdrawalsTable } from './WithdrawalsTable'
import { getPendenciesAction } from './requests.actions'

type TabValue = 'withdrawals' | 'deposits' | 'support' | 'subscriptions'

export default function RequestsPage() {
  const [tab, setTab] = useState<TabValue>('withdrawals')
  const [pendings, setPendings] = useState<Record<string, number>>({})

  useEffect(() => {
    getPendenciesAction()
      .then(result => {
        setPendings(Object.fromEntries(result.map(item => [item.requests, item.pendings])))
      })
      .catch(() => {})
  }, [tab])

  function handleChange(_event: SyntheticEvent, value: TabValue) {
    setTab(value)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='h1'>Solicitações</Typography>

      <Card>
        <Tabs value={tab} onChange={handleChange} variant='scrollable' scrollButtons='auto'>
          <Tab
            value='withdrawals'
            label={
              <Badge badgeContent={pendings.withdrawals} color='primary'>
                <Box sx={{ px: 1 }}>Saques</Box>
              </Badge>
            }
          />
          <Tab value='deposits' label='Depósitos' />
          <Tab
            value='support'
            label={
              <Badge badgeContent={pendings.support} color='primary'>
                <Box sx={{ px: 1 }}>Suporte</Box>
              </Badge>
            }
          />
          <Tab value='subscriptions' label='Adesões' />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 'withdrawals' && <WithdrawalsTable userId='all' />}
          {tab === 'deposits' && <DepositsTable userId='all' />}
          {tab === 'support' && <SupportTable userId='all' />}
          {tab === 'subscriptions' && <SubscriptionsTable userId='all' />}
        </Box>
      </Card>
    </Box>
  )
}
