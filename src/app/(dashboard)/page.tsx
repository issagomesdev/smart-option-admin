'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import type { RangeKeyDict } from 'react-date-range'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Modal } from '@/components/ui/Modal'
import { RadialProgress } from '@/components/ui/RadialProgress'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/toast'
import { RentabilidadeChart } from '@/components/charts/RentabilidadeChart'
import type { BotUserListItem } from '@/domain/dtos/users.dto'
import type { DashboardFilters, DashboardSummary, PeriodKind } from '@/domain/dtos/dashboard.dto'
import { products } from '@/domain/products'
import { KpiCardsRow } from './KpiCardsRow'
import { RecentMovementsTable } from './RecentMovementsTable'
import { getDashboardSummaryAction, getPlansAction, searchBotUsersAction } from './dashboard.actions'

// `react-date-range` (JS + CSS) só carrega quando o modal de período abre —
// ver `PeriodRangePicker.tsx`.
const PeriodRangePicker = dynamic(() => import('./PeriodRangePicker').then(mod => mod.PeriodRangePicker), {
  ssr: false,
  loading: () => <LoadingScreen fullPage={false} />
})

const PERIOD_OPTIONS: { value: PeriodKind; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'custom', label: 'Personalizado' }
]

function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatBrDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodKind>('today')
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null)
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null)
  const [productId, setProductId] = useState('all')

  const [plans, setPlans] = useState<{ id: number; name: string }[]>([])
  const [userOptions, setUserOptions] = useState<BotUserListItem[]>([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)

  const [periodModalOpen, setPeriodModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }])

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    getPlansAction()
      .then(setPlans)
      .catch(() => toast.error('Não foi possível carregar os planos.'))
  }, [])

  const fetchSummary = useCallback(() => {
    setLoading(true)
    setLoadError(false)

    const filters: DashboardFilters = {
      period,
      ...(period === 'custom' && customRange ? { start: customRange.start, end: customRange.end } : {}),
      ...(selectedUser ? { userId: selectedUser.id } : {}),
      ...(productId !== 'all' ? { productId: Number(productId) } : {})
    }

    getDashboardSummaryAction(filters)
      .then(setSummary)
      .catch(() => {
        setLoadError(true)
        toast.error('Não foi possível carregar o dashboard.')
      })
      .finally(() => setLoading(false))
  }, [period, customRange, selectedUser, productId])

  useEffect(() => {
    // Período "personalizado" só dispara a busca depois que um intervalo de verdade foi confirmado
    // no modal — sem isso, trocar pra "Personalizado" buscaria com `start`/`end` ainda vazios.
    if (period === 'custom' && !customRange) return
    fetchSummary()
  }, [fetchSummary, period, customRange])

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

  /**
   * Bug real herdado do dashboard antigo (mesmo bloco de filtro, copiado como estava): o MUI dispara
   * `onInputChange` de novo logo depois de uma seleção (`reason='reset'`, preenchendo o campo com o
   * rótulo da opção escolhida, ex.: "#285 - hayssa gomes") — sem este guard, isso disparava uma nova
   * busca por esse texto, esvaziando `userOptions` e quebrando o `value` do Autocomplete (o campo
   * voltava a mostrar "Toda a rede" mesmo com alguém selecionado). Só busca de verdade quando quem
   * digitou foi a pessoa (`reason==='input'`).
   */
  function handleUserInputChange(value: string, reason: string) {
    if (reason !== 'input') return
    handleUserSearch(value)
  }

  function handleDateRangeChange(item: RangeKeyDict) {
    setDateRange([{ ...item.selection, key: 'selection' } as (typeof dateRange)[number]])
  }

  function confirmCustomRange() {
    const { startDate, endDate } = dateRange[0]
    setCustomRange({ start: formatIsoDate(startDate), end: formatIsoDate(endDate) })
    setPeriodModalOpen(false)
  }

  function handlePeriodChange(value: PeriodKind | null) {
    if (!value) return
    setPeriod(value)
    if (value === 'custom') {
      setPeriodModalOpen(true)
    } else {
      setCustomRange(null)
    }
  }

  /** "Tudo" (sem recorte de usuário/plano) — o mesmo estado inicial que "Limpar filtros" restaura. */
  const hasActiveFilters = period !== 'all' || selectedUser !== null || productId !== 'all'

  function clearFilters() {
    setPeriod('all')
    setCustomRange(null)
    setSelectedUser(null)
    setProductId('all')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant='h1'>Dashboard</Typography>

      <Card title='Filtros'>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 'auto' }}>
            <ToggleButtonGroup
              value={period}
              exclusive
              size='small'
              onChange={(_event, value: PeriodKind | null) => handlePeriodChange(value)}
              aria-label='Período'
            >
              {PERIOD_OPTIONS.map(option => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {period === 'custom' && customRange && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                {formatBrDate(customRange.start)} a {formatBrDate(customRange.end)}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Autocomplete
              options={userOptions}
              loading={userSearchLoading}
              getOptionLabel={option => `#${option.id} - ${option.name}`}
              value={selectedUser ? (userOptions.find(option => option.id === selectedUser.id) ?? null) : null}
              onChange={(_event, value) => setSelectedUser(value ? { id: value.id, name: value.name } : null)}
              onInputChange={(_event, value, reason) => handleUserInputChange(value, reason)}
              renderInput={params => <TextField {...params} label='Filtrar por Usuário' placeholder='Toda a rede' />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, md: 'auto' }} sx={{ ml: { md: 'auto' } }}>
            <Button intent='ghost' onClick={clearFilters} disabled={!hasActiveFilters}>
              Limpar filtros
            </Button>
          </Grid>
        </Grid>
      </Card>

      {summary ? (
        // Refetch mantém o conteúdo anterior visível (só com opacidade reduzida) em vez de trocar
        // por skeleton/pular layout — troca de filtro não deve "piscar" a tela inteira.
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.15s ease',
            pointerEvents: loading ? 'none' : 'auto'
          }}
          aria-busy={loading}
        >
          <KpiCardsRow kpis={summary.kpis} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card title='Rentabilidade da rede'>
                <RentabilidadeChart data={summary.chart.points} granularity={summary.chart.granularity} />
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card title='Solicitações aprovadas hoje'>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <RadialProgress
                    percent={summary.approvedToday.percent}
                    label={`${summary.approvedToday.count} de ${summary.approvedToday.total}`}
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Card title='Movimentações recentes'>
            <RecentMovementsTable movements={summary.recentMovements} />
          </Card>
        </Box>
      ) : loading ? (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map(index => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <SkeletonCard height={140} />
              </Grid>
            ))}
          </Grid>
          <SkeletonCard height={280} />
        </Stack>
      ) : loadError ? (
        <Card>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography color='text.secondary'>Não foi possível carregar o dashboard.</Typography>
            <Button intent='secondary' onClick={fetchSummary}>
              Tentar novamente
            </Button>
          </Stack>
        </Card>
      ) : null}

      <Modal
        open={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        title='Selecionar período'
        maxWidth='sm'
        actions={
          <>
            <Button
              intent='ghost'
              onClick={() => {
                setPeriodModalOpen(false)
                if (!customRange) setPeriod('today')
              }}
            >
              Cancelar
            </Button>
            <Button intent='primary' onClick={confirmCustomRange}>
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
