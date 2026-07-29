'use client'

import { useState, type SyntheticEvent } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { Card } from '@/components/ui/Card'
import { AuditMovementsTable } from './AuditMovementsTable'
import { AuditActionsTable } from './AuditActionsTable'

type TabValue = 'movements' | 'actions'

/**
 * Duas trilhas, duas perguntas diferentes: "Movimentações" mostra o dinheiro que se moveu (o razão
 * contábil, em `wallet_transactions`), "Ações administrativas" mostra quem interveio no sistema
 * (`audit_logs`). Ficam na mesma tela por serem o mesmo trabalho de investigação, mas leem tabelas
 * distintas de propósito.
 */
export default function AuditPage() {
  const [tab, setTab] = useState<TabValue>('movements')

  function handleChange(_event: SyntheticEvent, value: TabValue) {
    setTab(value)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='h1'>Auditoria</Typography>

      <Card>
        <Tabs value={tab} onChange={handleChange} variant='scrollable' scrollButtons='auto'>
          <Tab value='movements' label='Movimentações' />
          <Tab value='actions' label='Ações administrativas' />
        </Tabs>
      </Card>

      {tab === 'movements' ? <AuditMovementsTable /> : <AuditActionsTable />}
    </Box>
  )
}
