'use client'

import { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import PlusIcon from 'mdi-material-ui/Plus'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import { fetchAllPages } from '@/components/data-table/export'
import {
  PLAN_PURCHASE_TYPE_LABELS,
  type PaginatedPlans,
  type Plan,
  type PlanPurchaseType
} from '@/domain/dtos/plans.dto'
import { listPlansAction } from './plans.actions'
import { PlanRowActions } from './PlanRowActions'

const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, totalPages: 1 }

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percentFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface Filters {
  page: number
  limit: number
  sortBy?: string
  sortDirection: 'asc' | 'desc'
  search: string
  purchaseType: PlanPurchaseType | 'all'
  isActive: 'all' | 'true' | 'false'
}

const INITIAL_FILTERS: Filters = {
  page: 1,
  limit: 20,
  sortBy: 'id',
  sortDirection: 'asc',
  search: '',
  purchaseType: 'all',
  isActive: 'all'
}

export function PlansList() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [result, setResult] = useState<PaginatedPlans>({ data: [], pagination: EMPTY_PAGINATION })
  const [loading, setLoading] = useState(true)

  const buildRequestFilters = useCallback(
    (overrides: Partial<Filters> = {}) => {
      const merged = { ...filters, ...overrides }
      return {
        page: merged.page,
        limit: merged.limit,
        sortBy: merged.sortBy,
        sortDirection: merged.sortDirection,
        ...(merged.search.trim() ? { search: merged.search.trim() } : {}),
        ...(merged.purchaseType !== 'all' ? { purchaseType: merged.purchaseType } : {}),
        ...(merged.isActive !== 'all' ? { isActive: merged.isActive === 'true' } : {})
      }
    },
    [filters]
  )

  const fetchRows = useCallback(() => {
    setLoading(true)
    listPlansAction(buildRequestFilters())
      .then(setResult)
      .catch(() => toast.error('Não foi possível carregar os planos.'))
      .finally(() => setLoading(false))
  }, [buildRequestFilters])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  /** Toda troca de filtro volta para a página 1 — senão a busca pode cair numa página que não existe mais. */
  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(current => ({ ...current, [key]: value, page: 1 }))
  }

  function handleSortChange(column: string) {
    setFilters(current => ({
      ...current,
      sortBy: column,
      sortDirection: current.sortBy === column && current.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1
    }))
  }

  const columns: DataTableColumn<Plan>[] = [
    { key: 'id', label: 'ID', sortable: true, width: 80 },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: row => (
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            {row.name}
          </Typography>
          {row.isSystem && (
            <Typography variant='caption' color='text.secondary'>
              Plano do sistema
            </Typography>
          )}
        </Box>
      ),
      exportValue: row => row.name
    },
    {
      key: 'price',
      label: 'Valor',
      sortable: true,
      align: 'right',
      render: row => currencyFormatter.format(row.price),
      exportValue: row => String(row.price)
    },
    {
      key: 'earningsMonthly',
      label: 'Rentabilidade',
      sortable: true,
      align: 'right',
      render: row => `${percentFormatter.format(row.earningsMonthly)}%`,
      exportValue: row => String(row.earningsMonthly)
    },
    {
      key: 'purchaseType',
      label: 'Tipo',
      sortable: true,
      render: row => PLAN_PURCHASE_TYPE_LABELS[row.purchaseType],
      exportValue: row => PLAN_PURCHASE_TYPE_LABELS[row.purchaseType]
    },
    {
      key: 'subscriberCount',
      label: 'Assinantes',
      align: 'right',
      render: row => row.subscriberCount,
      exportValue: row => String(row.subscriberCount)
    },
    {
      key: 'isActive',
      label: 'Situação',
      render: row =>
        row.isActive ? <StatusBadge label='Ativo' tone='success' /> : <StatusBadge label='Inativo' tone='neutral' />,
      exportValue: row => (row.isActive ? 'Ativo' : 'Inativo')
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant='h1'>Planos</Typography>
        {/* Sem `DemoGuard` de propósito: o catálogo de planos é dado descartável, restaurado a cada
            `demo:reset`, e o backend permite a escrita na demonstração (só as ações irreversíveis
            ou com efeito externo são bloqueadas). O visitante consegue exercitar o CRUD inteiro —
            que é justamente o que a demonstração quer mostrar. */}
        <Button intent='primary' component={NextLink} href='/plans/create' startIcon={<PlusIcon fontSize='small' />}>
          Novo plano
        </Button>
      </Box>

      <Card title='Filtros'>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label='Pesquisar'
              placeholder='Nome ou descrição'
              size='small'
              fullWidth
              value={filters.search}
              onChange={event => updateFilter('search', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel id='plans-type-label'>Tipo</InputLabel>
              <Select
                labelId='plans-type-label'
                label='Tipo'
                value={filters.purchaseType}
                onChange={event => updateFilter('purchaseType', event.target.value as Filters['purchaseType'])}
              >
                <MenuItem value='all'>Todos</MenuItem>
                <MenuItem value='auto'>{PLAN_PURCHASE_TYPE_LABELS.auto}</MenuItem>
                <MenuItem value='manual'>{PLAN_PURCHASE_TYPE_LABELS.manual}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel id='plans-active-label'>Situação</InputLabel>
              <Select
                labelId='plans-active-label'
                label='Situação'
                value={filters.isActive}
                onChange={event => updateFilter('isActive', event.target.value as Filters['isActive'])}
              >
                <MenuItem value='all'>Todas</MenuItem>
                <MenuItem value='true'>Ativos</MenuItem>
                <MenuItem value='false'>Inativos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <DataTable
        ariaLabel='Planos'
        exportFilenameBase='planos'
        onExportAll={() => fetchAllPages(page => listPlansAction(buildRequestFilters({ page, limit: 100 })))}
        columns={columns}
        rows={result.data}
        getRowKey={row => row.id}
        loading={loading}
        pagination={result.pagination}
        onPageChange={page => setFilters(current => ({ ...current, page }))}
        onLimitChange={limit => setFilters(current => ({ ...current, limit, page: 1 }))}
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSortChange={handleSortChange}
        emptyTitle='Nenhum plano encontrado'
        emptyDescription='Ajuste os filtros ou cadastre um plano novo.'
        rowActions={row => (
          <PlanRowActions
            planId={row.id}
            planName={row.name}
            isSystem={row.isSystem}
            subscriberCount={row.subscriberCount}
            onChanged={fetchRows}
          />
        )}
      />
    </Box>
  )
}
