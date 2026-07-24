'use client'

import { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { fetchAllPages } from '@/components/data-table/export'
import { useHasPermission } from '@/components/shell/SessionContext'
import { toast } from '@/components/ui/toast'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import type { SupportFiltersParams, SupportItem } from '@/domain/dtos/requests.dto'
import { listSupportRequestsAction, markSupportAsReadAction } from './requests.actions'
import { SupportDetailDialog } from './SupportDetailDialog'

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 1 }

export interface SupportTableProps {
  userId: number | 'all'
}

export function SupportTable({ userId }: SupportTableProps) {
  const canMarkRead = useHasPermission('support.write')
  const [rows, setRows] = useState<SupportItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SupportFiltersParams>({
    id: '',
    name: '',
    type: 'all',
    is_read: 'all',
    created_at: ''
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [detailItem, setDetailItem] = useState<SupportItem | null>(null)

  const fetchRows = useCallback(() => {
    setLoading(true)
    listSupportRequestsAction(userId, { ...filters, page, limit })
      .then(result => {
        setRows(result.data)
        setPagination(result.pagination)
      })
      .catch(() => toast.error('Não foi possível carregar as solicitações de suporte.'))
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

  async function toggleRead(id: number, read: boolean) {
    try {
      await markSupportAsReadAction(id, read ? 1 : 0)
      toast.success(read ? 'Solicitação marcada como concluída' : 'Solicitação marcada como pendente')
      fetchRows()
    } catch {
      toast.error('Não foi possível atualizar a solicitação.')
    }
  }

  function exportAllSupportRequests() {
    return fetchAllPages((page, limit) => listSupportRequestsAction(userId, { ...filters, page, limit }))
  }

  const columns: DataTableColumn<SupportItem>[] = [{ key: 'id', label: 'ID', width: 72, sortable: true }]

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
      key: 'type',
      label: 'Assunto',
      sortable: true,
      render: row => (row.type === 'support' ? 'Suporte Técnico' : 'Adesão de Serviço')
    },
    {
      key: 'is_read',
      label: 'Concluído',
      render: row => (
        <Tooltip title={canMarkRead ? (row.is_read ? 'Marcar como pendente' : 'Marcar como concluído') : ''}>
          <Checkbox
            checked={Boolean(row.is_read)}
            disabled={!canMarkRead}
            onChange={event => toggleRead(row.id, event.target.checked)}
            slotProps={{ input: { 'aria-label': `Concluído — solicitação #${row.id}` } }}
          />
        </Tooltip>
      ),
      exportValue: row => (row.is_read ? 'Sim' : 'Não')
    },
    { key: 'created_at', label: 'Data', sortable: true },
    {
      key: 'actions',
      label: 'Detalhes',
      excludeFromExport: true,
      render: row => (
        <Button intent='ghost' onClick={() => setDetailItem(row)}>
          Visualizar
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
          <FormControl size='small' fullWidth>
            <InputLabel id='support-type-label'>Assunto</InputLabel>
            <Select
              labelId='support-type-label'
              label='Assunto'
              value={filters.type}
              onChange={event => updateFilter('type', event.target.value)}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='support'>Suporte Técnico</MenuItem>
              <MenuItem value='service'>Adesão de Serviço</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='support-read-label'>Concluído</InputLabel>
            <Select
              labelId='support-read-label'
              label='Concluído'
              value={filters.is_read}
              onChange={event => updateFilter('is_read', event.target.value)}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='1'>Sim</MenuItem>
              <MenuItem value='0'>Não</MenuItem>
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
        ariaLabel='Solicitações de suporte'
        exportFilenameBase='solicitacoes-suporte'
        onExportAll={exportAllSupportRequests}
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
        emptyTitle='Nenhuma solicitação de suporte encontrada'
      />

      <SupportDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
    </Box>
  )
}
