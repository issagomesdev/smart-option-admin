'use client'

import { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import PlusIcon from 'mdi-material-ui/Plus'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { fetchAllPages } from '@/components/data-table/export'
import { useHasPermission } from '@/components/shell/SessionContext'
import { StatusBadge, booleanStatusToBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import type { BotUserListItem, BotUsersFilters } from '@/domain/dtos/users.dto'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import { products } from '@/domain/products'
import { getPlansAction } from '../dashboard.actions'
import { TransferDialog } from './TransferDialog'
import { UserRowActions } from './UserRowActions'
import { listBotUsersAction, setBotUserActiveAction } from './users.actions'

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 1 }

const INITIAL_FILTERS: BotUsersFilters = {
  user_id: '',
  name: '',
  email: '',
  product_id: 'all',
  status: 'all',
  is_active: 'all',
  telegram: '',
  balance: '',
  created_at: ''
}

export default function UsersPage() {
  const canWrite = useHasPermission('users.write')
  const [rows, setRows] = useState<BotUserListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BotUsersFilters>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [plans, setPlans] = useState<{ id: number; name: string }[]>([])
  const [transferUserId, setTransferUserId] = useState<number | null>(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    listBotUsersAction({ ...filters, page, limit })
      .then(result => {
        setRows(result.data)
        setPagination(result.pagination)
      })
      .catch(() => toast.error('Não foi possível carregar os usuários.'))
      .finally(() => setLoading(false))
  }, [filters, page, limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    getPlansAction()
      .then(setPlans)
      .catch(() => toast.error('Não foi possível carregar os planos.'))
  }, [])

  function updateFilter<K extends keyof BotUsersFilters>(key: K, value: BotUsersFilters[K]) {
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

  function exportAllUsers() {
    return fetchAllPages((page, limit) => listBotUsersAction({ ...filters, page, limit }))
  }

  async function toggleBlocked(userId: number, blocked: boolean) {
    try {
      await setBotUserActiveAction(userId, blocked ? 0 : 1)
      toast.success(blocked ? 'Usuário bloqueado' : 'Usuário desbloqueado')
      fetchUsers()
    } catch {
      toast.error('Não foi possível atualizar o usuário.')
    }
  }

  const columns: DataTableColumn<BotUserListItem>[] = [
    { key: 'id', label: 'ID', width: 72, sortable: true },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: row => (
        <NextLink href={`/users/${row.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>
          {row.name}
        </NextLink>
      ),
      exportValue: row => row.name
    },
    { key: 'email', label: 'E-mail', sortable: true },
    {
      key: 'plan',
      label: 'Plano',
      sortable: true,
      render: row => (row.plan === 'without' ? 'Nenhum' : (products[row.plan] ?? row.plan))
    },
    {
      key: 'telegram',
      label: 'Telegram',
      sortable: true,
      render: row => (row.telegram === 'off' ? '—' : row.telegram)
    },
    {
      key: 'balance',
      label: 'Saldo',
      align: 'right',
      sortable: true,
      render: row => `R$ ${Number(row.balance).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Situação',
      sortable: true,
      render: row => {
        const { label, tone } = booleanStatusToBadge(row.status === 1)
        return <StatusBadge label={label} tone={tone} />
      },
      exportValue: row => booleanStatusToBadge(row.status === 1).label
    },
    {
      key: 'is_active',
      label: 'Bloqueio',
      render: row => (
        <Tooltip title={canWrite ? (row.is_active ? 'Bloquear usuário' : 'Desbloquear usuário') : ''}>
          <Switch
            size='small'
            checked={!row.is_active}
            disabled={!canWrite}
            onChange={event => toggleBlocked(row.id, event.target.checked)}
            slotProps={{ input: { 'aria-label': `${row.is_active ? 'Bloquear' : 'Desbloquear'} ${row.name}` } }}
          />
        </Tooltip>
      ),
      exportValue: row => (row.is_active ? 'Desbloqueado' : 'Bloqueado')
    },
    { key: 'created_at', label: 'Cadastrado em', sortable: true }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant='h1'>Usuários</Typography>
        {canWrite && (
          <Button intent='primary' component={NextLink} href='/users/create' startIcon={<PlusIcon fontSize='small' />}>
            Novo usuário
          </Button>
        )}
      </Box>

      <Card title='Filtros'>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label='ID'
              size='small'
              fullWidth
              value={filters.user_id}
              onChange={event => updateFilter('user_id', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label='Nome'
              size='small'
              fullWidth
              value={filters.name}
              onChange={event => updateFilter('name', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label='E-mail'
              size='small'
              fullWidth
              value={filters.email}
              onChange={event => updateFilter('email', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl size='small' fullWidth>
              <InputLabel id='filter-plan-label'>Plano</InputLabel>
              <Select
                labelId='filter-plan-label'
                label='Plano'
                value={filters.product_id}
                onChange={event => updateFilter('product_id', event.target.value)}
              >
                <MenuItem value='all'>Todos</MenuItem>
                {plans.map(plan => (
                  <MenuItem key={plan.id} value={String(plan.id)}>
                    {products[plan.name] ?? plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <TextField
              label='Telegram'
              size='small'
              fullWidth
              value={filters.telegram}
              onChange={event => updateFilter('telegram', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label='Saldo'
              size='small'
              fullWidth
              value={filters.balance}
              onChange={event => updateFilter('balance', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl size='small' fullWidth>
              <InputLabel id='filter-status-label'>Situação</InputLabel>
              <Select
                labelId='filter-status-label'
                label='Situação'
                value={filters.status}
                onChange={event => updateFilter('status', event.target.value)}
              >
                <MenuItem value='all'>Todos</MenuItem>
                <MenuItem value='1'>Ativo</MenuItem>
                <MenuItem value='0'>Inativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl size='small' fullWidth>
              <InputLabel id='filter-blocked-label'>Bloqueio</InputLabel>
              <Select
                labelId='filter-blocked-label'
                label='Bloqueio'
                value={filters.is_active}
                onChange={event => updateFilter('is_active', event.target.value)}
              >
                <MenuItem value='all'>Todos</MenuItem>
                <MenuItem value='1'>Desbloqueado</MenuItem>
                <MenuItem value='0'>Bloqueado</MenuItem>
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
      </Card>

      <DataTable
        ariaLabel='Usuários'
        exportFilenameBase='usuarios'
        onExportAll={exportAllUsers}
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
        emptyTitle='Nenhum usuário encontrado'
        emptyDescription='Ajuste os filtros ou cadastre um novo usuário.'
        rowActions={row => (
          <UserRowActions userId={row.id} userName={row.name} onDeleted={fetchUsers} onTransfer={setTransferUserId} />
        )}
      />

      <TransferDialog
        userId={transferUserId}
        onClose={() => setTransferUserId(null)}
        onDone={() => {
          setTransferUserId(null)
          fetchUsers()
        }}
      />
    </Box>
  )
}
