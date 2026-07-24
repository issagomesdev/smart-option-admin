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
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { fetchAllPages } from '@/components/data-table/export'
import { useHasPermission } from '@/components/shell/SessionContext'
import { StatusBadge, withdrawalStatusToBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import type { ListFiltersParams, WithdrawalItem } from '@/domain/dtos/requests.dto'
import { listWithdrawalsAction } from './requests.actions'
import { RespondWithdrawalDialog } from './RespondWithdrawalDialog'

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 1 }

export interface WithdrawalsTableProps {
  userId: number | 'all'
}

export function WithdrawalsTable({ userId }: WithdrawalsTableProps) {
  const canApprove = useHasPermission('withdrawals.approve')
  const [rows, setRows] = useState<WithdrawalItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ListFiltersParams>({
    id: '',
    name: '',
    value: '',
    status: 'all',
    created_at: ''
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [respondItem, setRespondItem] = useState<WithdrawalItem | null>(null)

  const fetchRows = useCallback(() => {
    setLoading(true)
    listWithdrawalsAction(userId, { ...filters, page, limit })
      .then(result => {
        setRows(result.data)
        setPagination(result.pagination)
      })
      .catch(() => toast.error('Não foi possível carregar as solicitações de saque.'))
      .finally(() => setLoading(false))
  }, [userId, filters, page, limit])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  function updateFilter<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
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

  function exportAllWithdrawals() {
    return fetchAllPages((page, limit) => listWithdrawalsAction(userId, { ...filters, page, limit }))
  }

  const columns: DataTableColumn<WithdrawalItem>[] = [{ key: 'id', label: 'ID', width: 72, sortable: true }]

  if (userId === 'all') {
    columns.push({
      key: 'name',
      label: 'Usuário',
      sortable: true,
      render: row => (
        <NextLink href={`/users/${row.user_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {row.name}
        </NextLink>
      ),
      exportValue: row => row.name
    })
  }

  columns.push(
    {
      key: 'value',
      label: 'Valor',
      align: 'right',
      sortable: true,
      render: row => `R$ ${Number(row.value).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Situação',
      sortable: true,
      render: row => {
        const { label, tone } = withdrawalStatusToBadge(row.status)
        return <StatusBadge label={label} tone={tone} />
      },
      exportValue: row => withdrawalStatusToBadge(row.status).label
    },
    { key: 'created_at', label: 'Data', sortable: true },
    {
      key: 'actions',
      label: 'Detalhes',
      excludeFromExport: true,
      render: row => (
        <Button intent='ghost' onClick={() => setRespondItem(row)}>
          {row.status === 'pending' && canApprove ? 'Responder' : 'Visualizar'}
        </Button>
      )
    }
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            label='ID'
            size='small'
            fullWidth
            value={filters.id}
            onChange={event => updateFilter('id', event.target.value)}
          />
        </Grid>
        {userId === 'all' && (
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <TextField
              label='Nome'
              size='small'
              fullWidth
              value={filters.name}
              onChange={event => updateFilter('name', event.target.value)}
            />
          </Grid>
        )}
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            label='Valor'
            size='small'
            fullWidth
            value={filters.value}
            onChange={event => updateFilter('value', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='withdrawal-status-label'>Situação</InputLabel>
            <Select
              labelId='withdrawal-status-label'
              label='Situação'
              value={filters.status}
              onChange={event => updateFilter('status', event.target.value)}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='pending'>Pendente</MenuItem>
              <MenuItem value='authorized'>Autorizado</MenuItem>
              <MenuItem value='success'>Concluído</MenuItem>
              <MenuItem value='refused'>Recusado</MenuItem>
              <MenuItem value='failed'>Falhou</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            label='Cadastrado em'
            size='small'
            fullWidth
            placeholder='DD/MM/AAAA'
            value={filters.created_at}
            onChange={event => updateFilter('created_at', event.target.value)}
          />
        </Grid>
      </Grid>

      <DataTable
        ariaLabel='Solicitações de saque'
        exportFilenameBase='solicitacoes-saque'
        onExportAll={exportAllWithdrawals}
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
        emptyTitle='Nenhuma solicitação de saque encontrada'
      />

      <RespondWithdrawalDialog item={respondItem} onClose={() => setRespondItem(null)} onDone={fetchRows} />
    </Box>
  )
}
