'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountCash from 'mdi-material-ui/AccountCash'
import AccountMultiple from 'mdi-material-ui/AccountMultiple'
import AccountMultipleCheck from 'mdi-material-ui/AccountMultipleCheck'
import DiamondStone from 'mdi-material-ui/DiamondStone'
import Medal from 'mdi-material-ui/Medal'
import type { RangeKeyDict } from 'react-date-range'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/toast'
import type { BotUserListItem } from '@/domain/dtos/users.dto'
import { products } from '@/domain/products'
import {
  getDashboardBalanceAction,
  getDashboardUsersAction,
  getPlansAction,
  searchBotUsersAction
} from './dashboard.actions'

// `react-date-range` (JS + CSS) só carrega quando o modal de período abre —
// ver `PeriodRangePicker.tsx`.
const PeriodRangePicker = dynamic(() => import('./PeriodRangePicker').then(mod => mod.PeriodRangePicker), {
  ssr: false,
  loading: () => <LoadingScreen fullPage={false} />
})

interface StatCard {
  id: string
  label: string
  value: number | string
  icon: React.ReactNode
  gridSize: number
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#b08d57',
  silver: '#94a3b8',
  gold: '#eab308',
  diamond: '#818cf8'
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<StatCard[] | null>(null)
  const [balanceStats, setBalanceStats] = useState<StatCard[] | null>(null)
  const [plans, setPlans] = useState<{ id: number; name: string }[]>([])

  const [selectedUser, setSelectedUser] = useState<{ id: number | 'all'; name: string }>({ id: 'all', name: 'Todos' })
  const [productId, setProductId] = useState('all')
  const [period, setPeriod] = useState<{ value: string; label: string }>({ value: 'all', label: 'Todos' })

  const [userOptions, setUserOptions] = useState<BotUserListItem[]>([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)

  const [periodModalOpen, setPeriodModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }])

  useEffect(() => {
    getDashboardUsersAction()
      .then(data => {
        setUserStats([
          {
            id: 'all',
            label: 'Total de Usuários',
            value: data.allUsers,
            icon: <AccountMultiple sx={{ fontSize: 44, color: 'primary.main' }} />,
            gridSize: 6
          },
          {
            id: 'active',
            label: 'Usuários Ativos',
            value: data.activeUsers,
            icon: <AccountMultipleCheck sx={{ fontSize: 44, color: 'success.main' }} />,
            gridSize: 6
          },
          {
            id: 'bronze',
            label: 'Bronze',
            value: data.bronzeUsers,
            icon: <Medal sx={{ fontSize: 40, color: TIER_COLORS.bronze }} />,
            gridSize: 3
          },
          {
            id: 'silver',
            label: 'Prata',
            value: data.silverUsers,
            icon: <Medal sx={{ fontSize: 40, color: TIER_COLORS.silver }} />,
            gridSize: 3
          },
          {
            id: 'gold',
            label: 'Ouro',
            value: data.goldUsers,
            icon: <Medal sx={{ fontSize: 40, color: TIER_COLORS.gold }} />,
            gridSize: 3
          },
          {
            id: 'diamond',
            label: 'Diamante',
            value: data.diamondUsers,
            icon: <DiamondStone sx={{ fontSize: 40, color: TIER_COLORS.diamond }} />,
            gridSize: 3
          }
        ])
      })
      .catch(() => toast.error('Não foi possível carregar as estatísticas de usuários.'))

    getPlansAction()
      .then(setPlans)
      .catch(() => toast.error('Não foi possível carregar os planos.'))
  }, [])

  useEffect(() => {
    getDashboardBalanceAction({ user_id: String(selectedUser.id), product_id: productId, period: period.value })
      .then(data => {
        setBalanceStats(
          data.map((entry, index) => ({
            id: `balance-${index}`,
            label: entry.name,
            value: entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: <AccountCash sx={{ fontSize: 40, color: 'primary.main' }} />,
            gridSize: 4
          }))
        )
      })
      .catch(() => toast.error('Não foi possível carregar o saldo consolidado.'))
  }, [selectedUser, productId, period])

  async function handleUserSearch(search: string) {
    setUserSearchLoading(true)
    try {
      const results = await searchBotUsersAction(search)
      setUserOptions(results)
    } catch {
      toast.error('Não foi possível buscar usuários.')
    } finally {
      setUserSearchLoading(false)
    }
  }

  function handleDateRangeChange(item: RangeKeyDict) {
    setDateRange([{ ...item.selection, key: 'selection' } as (typeof dateRange)[number]])
  }

  function formatDate(date: Date) {
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
  }

  function confirmPeriod() {
    const { startDate, endDate } = dateRange[0]
    const value = `${formatDate(startDate)} - ${formatDate(endDate)}`
    setPeriod({ value, label: value })
    setPeriodModalOpen(false)
  }

  function clearPeriod() {
    setPeriod({ value: 'all', label: 'Todos' })
    setPeriodModalOpen(false)
  }

  function renderStatGrid(cards: StatCard[]) {
    return (
      <Grid container spacing={2}>
        {cards.map(card => (
          <Grid key={card.id} size={{ xs: 6, md: card.gridSize }}>
            <Card>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center' }}>
                {card.icon}
                <Typography variant='body2' color='text.secondary'>
                  {card.label}
                </Typography>
                {/* `component='p'`: é um valor numérico de destaque, não um heading de
                    verdade — sem isso, `variant='h3'` sozinho renderia um <h3>
                    logo após o <h1> "Dashboard", pulando o h2 (achado real de auditoria). */}
                <Typography variant='h3' component='p'>
                  {card.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant='h1'>Dashboard</Typography>

      {userStats ? renderStatGrid(userStats) : <LoadingScreen fullPage={false} label='Carregando estatísticas...' />}

      <Card title='Filtros'>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              options={userOptions}
              loading={userSearchLoading}
              getOptionLabel={option => `#${option.id} - ${option.name}`}
              value={
                selectedUser.id === 'all' ? null : (userOptions.find(option => option.id === selectedUser.id) ?? null)
              }
              onChange={(_event, value) =>
                setSelectedUser(value ? { id: value.id, name: value.name } : { id: 'all', name: 'Todos' })
              }
              onInputChange={(_event, value) => handleUserSearch(value)}
              renderInput={params => <TextField {...params} label='Filtrar por Usuário' placeholder='Todos' />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel id='filter-product-label'>Filtrar por Plano</InputLabel>
              <Select
                labelId='filter-product-label'
                label='Filtrar por Plano'
                value={productId}
                onChange={event => setProductId(event.target.value)}
              >
                <MenuItem value='all'>Todos</MenuItem>
                {plans.map(plan => (
                  <MenuItem key={plan.id} value={String(plan.id)}>
                    {products[plan.name as keyof typeof products] ?? plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label='Filtrar por Período'
              value={period.label}
              slotProps={{ input: { readOnly: true } }}
              onClick={() => setPeriodModalOpen(true)}
            />
          </Grid>
        </Grid>
      </Card>

      {balanceStats ? renderStatGrid(balanceStats) : <LoadingScreen fullPage={false} label='Carregando saldo...' />}

      <Modal
        open={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        title='Selecionar período'
        maxWidth='sm'
        actions={
          <>
            <Button intent='ghost' onClick={clearPeriod}>
              Limpar
            </Button>
            <Button intent='primary' onClick={confirmPeriod}>
              Confirmar
            </Button>
          </>
        }
      >
        <PeriodRangePicker ranges={dateRange} onChange={handleDateRangeChange} />
      </Modal>
    </Box>
  )
}
