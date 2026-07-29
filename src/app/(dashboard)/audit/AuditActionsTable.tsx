'use client'

import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { toast } from '@/components/ui/toast'
import { fetchAllPages } from '@/components/data-table/export'
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_VALUES,
  type AuditActionItem,
  type AuditActionValue,
  type PaginatedAuditActions
} from '@/domain/dtos/audit-actions.dto'
import { listAuditActionsAction } from './audit.actions'
import { AuditActionDetailDialog } from './AuditActionDetailDialog'

const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, totalPages: 1 }

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tudo' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' }
] as const

type PeriodOption = (typeof PERIOD_OPTIONS)[number]['value']

interface Filters {
  page: number
  limit: number
  period: PeriodOption
  entityType: string
  action: AuditActionValue | 'all'
  search: string
}

const INITIAL_FILTERS: Filters = {
  page: 1,
  limit: 20,
  period: 'all',
  entityType: 'all',
  action: 'all',
  search: ''
}

/** Cor por área, para varrer a lista visualmente sem ler cada rótulo. */
function toneFor(entityType: string): 'primary' | 'warning' | 'success' | 'info' | 'default' {
  switch (entityType) {
    case 'staff_users':
    case 'roles':
      return 'warning'
    case 'withdrawals':
      return 'success'
    case 'bot_users':
      return 'primary'
    case 'requests':
      return 'info'
    default:
      return 'default'
  }
}

export function AuditActionsTable() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [result, setResult] = useState<PaginatedAuditActions>({ data: [], pagination: EMPTY_PAGINATION })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AuditActionItem | null>(null)

  const buildRequestFilters = useCallback(
    (overrides: Partial<Filters> = {}) => {
      const merged = { ...filters, ...overrides }
      return {
        page: merged.page,
        limit: merged.limit,
        // "Tudo" simplesmente não envia `period` — o backend então não aplica filtro de data.
        ...(merged.period !== 'all' ? { period: merged.period } : {}),
        ...(merged.entityType !== 'all' ? { entityType: merged.entityType } : {}),
        ...(merged.action !== 'all' ? { action: merged.action } : {}),
        ...(merged.search.trim() ? { search: merged.search.trim() } : {})
      }
    },
    [filters]
  )

  const fetchRows = useCallback(() => {
    setLoading(true)
    listAuditActionsAction(buildRequestFilters())
      .then(setResult)
      .catch(() => toast.error('Não foi possível carregar a trilha de auditoria.'))
      .finally(() => setLoading(false))
  }, [buildRequestFilters])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(current => ({ ...current, [key]: value, page: 1 }))
  }

  const columns: DataTableColumn<AuditActionItem>[] = [
    {
      key: 'createdAt',
      label: 'Data',
      render: row => dateTimeFormatter.format(new Date(row.createdAt)),
      exportValue: row => row.createdAt
    },
    {
      key: 'action',
      label: 'Ação',
      render: row => (
        <Chip
          size='small'
          variant='outlined'
          color={toneFor(row.entityType)}
          label={AUDIT_ACTION_LABELS[row.action as AuditActionValue] ?? row.action}
          sx={{ cursor: 'default' }}
        />
      ),
      exportValue: row => AUDIT_ACTION_LABELS[row.action as AuditActionValue] ?? row.action
    },
    {
      key: 'actor',
      label: 'Autor',
      render: row => (
        <Box>
          <Typography variant='body2'>{row.actorName ?? '—'}</Typography>
          <Typography variant='caption' color='text.secondary'>
            {row.actorEmail ?? 'conta removida'}
          </Typography>
        </Box>
      ),
      exportValue: row => row.actorEmail ?? ''
    },
    {
      key: 'entityType',
      label: 'Área',
      render: row => AUDIT_ACTION_GROUPS[row.entityType] ?? row.entityType,
      exportValue: row => AUDIT_ACTION_GROUPS[row.entityType] ?? row.entityType
    },
    {
      key: 'entityId',
      label: 'Registro',
      render: row => (row.entityId ? `#${row.entityId}` : '—'),
      exportValue: row => row.entityId ?? ''
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card title='Filtros'>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 'auto' }}>
            <ToggleButtonGroup
              value={filters.period}
              exclusive
              size='small'
              onChange={(_event, value: PeriodOption | null) => value && updateFilter('period', value)}
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
            <FormControl fullWidth size='small'>
              <InputLabel id='audit-actions-area-label'>Área</InputLabel>
              <Select
                labelId='audit-actions-area-label'
                label='Área'
                value={filters.entityType}
                onChange={event => updateFilter('entityType', event.target.value)}
              >
                <MenuItem value='all'>Todas</MenuItem>
                {Object.entries(AUDIT_ACTION_GROUPS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel id='audit-actions-action-label'>Ação</InputLabel>
              <Select
                labelId='audit-actions-action-label'
                label='Ação'
                value={filters.action}
                onChange={event => updateFilter('action', event.target.value as Filters['action'])}
              >
                <MenuItem value='all'>Todas</MenuItem>
                {AUDIT_ACTION_VALUES.map(value => (
                  <MenuItem key={value} value={value}>
                    {AUDIT_ACTION_LABELS[value]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              label='Pesquisar'
              placeholder='Autor ou registro'
              size='small'
              fullWidth
              value={filters.search}
              onChange={event => updateFilter('search', event.target.value)}
            />
          </Grid>
        </Grid>
      </Card>

      <DataTable
        ariaLabel='Ações administrativas'
        exportFilenameBase='auditoria-acoes'
        onExportAll={() => fetchAllPages(page => listAuditActionsAction(buildRequestFilters({ page, limit: 100 })))}
        columns={columns}
        rows={result.data}
        getRowKey={row => row.id}
        loading={loading}
        pagination={result.pagination}
        onPageChange={page => setFilters(current => ({ ...current, page }))}
        onLimitChange={limit => setFilters(current => ({ ...current, limit, page: 1 }))}
        emptyTitle='Nenhuma ação registrada'
        emptyDescription='Ajuste os filtros para ver outros resultados.'
        rowActions={row => (
          <Typography
            component='button'
            type='button'
            variant='body2'
            onClick={() => setSelected(row)}
            sx={{
              background: 'none',
              border: 0,
              p: 0,
              color: 'primary.main',
              cursor: 'pointer',
              font: 'inherit'
            }}
          >
            Ver detalhes
          </Typography>
        )}
      />

      <AuditActionDetailDialog item={selected} onClose={() => setSelected(null)} />
    </Box>
  )
}
