'use client'

import { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { fetchAllPages } from '@/components/data-table/export'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import { AUDIT_TYPES, type AuditFiltersParams, type AuditMovementItem, type AuditType } from '@/domain/dtos/audit.dto'
import type { BotUserListItem } from '@/domain/dtos/users.dto'
import { describeMovement, describeMovementStatus } from '@/domain/movement-labels'
import { AuditDetailDialog } from './AuditDetailDialog'
import { listAuditMovementsAction } from './audit.actions'
import { searchBotUsersAction } from '../dashboard.actions'

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 1 }

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const TYPE_LABELS: Record<AuditType, string> = {
  deposit: 'Depósito PIX',
  withdrawal: 'Saque',
  earnings: 'Rendimento',
  profitability: 'Comissão de Rede',
  subscription: 'Adesão a Plano',
  tuition: 'Renovação de Plano',
  transfer_in: 'Transferência Recebida',
  transfer_out: 'Transferência Enviada',
  admin_adjustment: 'Ajuste Administrativo',
  diamond_tax: 'Taxa Diamond'
}

const PERIOD_OPTIONS: { value: NonNullable<AuditFiltersParams['period']> | 'all'; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' }
]

interface Filters {
  period: NonNullable<AuditFiltersParams['period']> | 'all'
  type: AuditType | 'all'
  status: NonNullable<AuditFiltersParams['status']> | 'all'
  minValue: string
  maxValue: string
  search: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const INITIAL_FILTERS: Filters = {
  period: 'all',
  type: 'all',
  status: 'all',
  minValue: '',
  maxValue: '',
  search: ''
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditMovementItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null)
  const [userOptions, setUserOptions] = useState<BotUserListItem[]>([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [detailItem, setDetailItem] = useState<AuditMovementItem | null>(null)

  function buildRequestFilters(overridePage?: number, overrideLimit?: number): AuditFiltersParams {
    return {
      page: overridePage ?? page,
      limit: overrideLimit ?? limit,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      ...(filters.period !== 'all' ? { period: filters.period } : {}),
      ...(filters.type !== 'all' ? { type: filters.type } : {}),
      ...(filters.status !== 'all' ? { status: filters.status } : {}),
      ...(selectedUser ? { userId: selectedUser.id } : {}),
      ...(filters.minValue ? { minValue: Number(filters.minValue) } : {}),
      ...(filters.maxValue ? { maxValue: Number(filters.maxValue) } : {}),
      ...(filters.search ? { search: filters.search } : {})
    }
  }

  const fetchRows = useCallback(() => {
    setLoading(true)
    listAuditMovementsAction(buildRequestFilters())
      .then(result => {
        setRows(result.data)
        setPagination(result.pagination)
      })
      .catch(() => toast.error('Não foi possível carregar a auditoria financeira.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedUser, page, limit])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(values => ({ ...values, [key]: value }))
    setPage(1)
  }

  function handleSortChange(column: string) {
    setFilters(values => ({
      ...values,
      sortBy: column,
      sortDirection: values.sortBy === column && values.sortDirection === 'asc' ? 'desc' : 'asc'
    }))
    setPage(1)
  }

  async function handleUserInputChange(value: string, reason: string) {
    if (reason !== 'input') return
    setUserSearchLoading(true)
    try {
      const results = await searchBotUsersAction(value)
      setUserOptions(results)
    } catch {
      toast.error('Não foi possível buscar usuários.')
    } finally {
      setUserSearchLoading(false)
    }
  }

  function exportAllMovements() {
    return fetchAllPages((page, limit) => listAuditMovementsAction(buildRequestFilters(page, limit)))
  }

  const columns: DataTableColumn<AuditMovementItem>[] = [
    {
      key: 'kind',
      label: 'Tipo',
      render: row => {
        const { label, icon: Icon, color } = describeMovement(row.kind, row.direction)
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ fontSize: 20, color }} aria-hidden />
            {label}
          </Box>
        )
      },
      exportValue: row => describeMovement(row.kind, row.direction).label
    },
    {
      key: 'userName',
      label: 'Usuário',
      sortable: true,
      render: row => (
        <NextLink href={`/users/${row.userId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {row.userName}
        </NextLink>
      ),
      exportValue: row => row.userName
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: row => dateTimeFormatter.format(new Date(row.createdAt))
    },
    {
      key: 'amount',
      label: 'Valor',
      align: 'right',
      sortable: true,
      render: row => {
        const signed = row.direction === 'debit' ? -row.amount : row.amount
        return (
          <Box
            component='span'
            sx={{ fontWeight: 600, color: row.direction === 'credit' ? 'success.main' : 'text.primary' }}
          >
            {signed < 0 ? '-' : '+'}
            {currencyFormatter.format(Math.abs(signed))}
          </Box>
        )
      },
      exportValue: row => String(row.direction === 'debit' ? -row.amount : row.amount)
    },
    {
      key: 'status',
      label: 'Status',
      render: row => {
        const { label, tone } = describeMovementStatus(row.status)
        return <StatusBadge label={label} tone={tone} />
      },
      exportValue: row => describeMovementStatus(row.status).label
    },
    { key: 'gateway', label: 'Gateway' },
    {
      key: 'actions',
      label: 'Detalhes',
      excludeFromExport: true,
      render: row => (
        <Button intent='ghost' onClick={() => setDetailItem(row)}>
          Ver detalhes
        </Button>
      )
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='h1'>Auditoria Financeira</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 'auto' }}>
          <ToggleButtonGroup
            value={filters.period}
            exclusive
            size='small'
            onChange={(_event, value: Filters['period'] | null) => {
              if (value) updateFilter('period', value)
            }}
            aria-label='Período'
          >
            {PERIOD_OPTIONS.map(option => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='audit-type-label'>Tipo</InputLabel>
            <Select
              labelId='audit-type-label'
              label='Tipo'
              value={filters.type}
              onChange={event => updateFilter('type', event.target.value as Filters['type'])}
            >
              <MenuItem value='all'>Todos</MenuItem>
              {AUDIT_TYPES.map(type => (
                <MenuItem key={type} value={type}>
                  {TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='audit-status-label'>Status</InputLabel>
            <Select
              labelId='audit-status-label'
              label='Status'
              value={filters.status}
              onChange={event => updateFilter('status', event.target.value as Filters['status'])}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='completed'>Concluído</MenuItem>
              <MenuItem value='pending'>Em aberto</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            size='small'
            options={userOptions}
            loading={userSearchLoading}
            getOptionLabel={option => `#${option.id} - ${option.name}`}
            value={selectedUser ? (userOptions.find(option => option.id === selectedUser.id) ?? null) : null}
            onChange={(_event, value) => {
              setSelectedUser(value ? { id: value.id, name: value.name } : null)
              setPage(1)
            }}
            onInputChange={(_event, value, reason) => handleUserInputChange(value, reason)}
            renderInput={params => <TextField {...params} label='Usuário' placeholder='Todos' />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            label='Valor mínimo'
            size='small'
            type='number'
            fullWidth
            value={filters.minValue}
            onChange={event => updateFilter('minValue', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            label='Valor máximo'
            size='small'
            type='number'
            fullWidth
            value={filters.maxValue}
            onChange={event => updateFilter('maxValue', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label='Pesquisar'
            size='small'
            fullWidth
            placeholder='Nome, referência ou ID'
            value={filters.search}
            onChange={event => updateFilter('search', event.target.value)}
          />
        </Grid>
      </Grid>

      <DataTable
        ariaLabel='Auditoria financeira'
        exportFilenameBase='auditoria-financeira'
        onExportAll={exportAllMovements}
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={newLimit => {
          setLimit(newLimit)
          setPage(1)
        }}
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSortChange={handleSortChange}
        emptyTitle='Nenhuma movimentação encontrada'
        emptyDescription='Ajuste os filtros para ver outros resultados.'
      />

      <AuditDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
    </Box>
  )
}
