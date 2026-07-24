'use client'

import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { fetchAllPages } from '@/components/data-table/export'
import { StatusBadge, booleanStatusToBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import type { NetworkFiltersParams, NetworkMember } from '@/domain/dtos/network.dto'
import { getNetworkAction } from './requests.actions'

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 1 }

export interface NetworkTableProps {
  userId: number
}

export function NetworkTable({ userId }: NetworkTableProps) {
  const [group, setGroup] = useState<'guests' | 'affiliates'>('guests')
  const [guests, setGuests] = useState<{ rows: NetworkMember[]; pagination: PaginationMeta }>({
    rows: [],
    pagination: EMPTY_PAGINATION
  })
  const [affiliates, setAffiliates] = useState<{ rows: NetworkMember[]; pagination: PaginationMeta }>({
    rows: [],
    pagination: EMPTY_PAGINATION
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NetworkFiltersParams>({ id: '', name: '', level: 'all', status: 'all' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    setLoading(true)
    getNetworkAction(userId, { ...filters, page, limit })
      .then(result => {
        setGuests({ rows: result.guests.data, pagination: result.guests.pagination })
        setAffiliates({ rows: result.affiliates.data, pagination: result.affiliates.pagination })
      })
      .catch(() => toast.error('Não foi possível carregar a rede.'))
      .finally(() => setLoading(false))
  }, [userId, filters, page, limit])

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

  const active = group === 'guests' ? guests : affiliates

  function exportAllNetwork() {
    return fetchAllPages((page, limit) =>
      getNetworkAction(userId, { ...filters, page, limit }).then(result => result[group])
    )
  }

  const columns: DataTableColumn<NetworkMember>[] = [
    { key: 'id', label: 'ID', width: 72, sortable: true },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: row => (
        <NextLink href={`/users/${row.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {row.name}
        </NextLink>
      ),
      exportValue: row => row.name
    },
    { key: 'level', label: 'Nível', sortable: true, render: row => `Nível ${row.level}` },
    {
      key: 'status',
      label: 'Situação',
      sortable: true,
      render: row => {
        const { label, tone } = booleanStatusToBadge(Boolean(row.status))
        return <StatusBadge label={label} tone={tone} />
      },
      exportValue: row => booleanStatusToBadge(Boolean(row.status)).label
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ToggleButtonGroup
        value={group}
        exclusive
        size='small'
        onChange={(_event, value) => {
          if (value) {
            setGroup(value)
            setPage(1)
          }
        }}
      >
        {/* `guests` = quem este usuário indicou (affiliateUserId = userId,
            "meus afiliados"); `affiliates` = quem indicou este usuário
            (guestUserId = userId, a afiliação/upline dele) — nomenclatura
            confirmada em `NetworkService.network` (backend). */}
        <ToggleButton value='guests'>Afiliados ({guests.pagination.total})</ToggleButton>
        <ToggleButton value='affiliates'>Afiliação ({affiliates.pagination.total})</ToggleButton>
      </ToggleButtonGroup>

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
        <Grid size={{ xs: 6, sm: 3, md: 3 }}>
          <TextField
            label='Nome'
            size='small'
            fullWidth
            value={filters.name}
            onChange={event => updateFilter('name', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='network-level-label'>Nível</InputLabel>
            <Select
              labelId='network-level-label'
              label='Nível'
              value={filters.level}
              onChange={event => updateFilter('level', event.target.value)}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='1'>Nível 1</MenuItem>
              <MenuItem value='2'>Nível 2</MenuItem>
              <MenuItem value='3'>Nível 3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='network-status-label'>Situação</InputLabel>
            <Select
              labelId='network-status-label'
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
      </Grid>

      <DataTable
        ariaLabel='Rede de afiliados'
        exportFilenameBase={`rede-${group === 'guests' ? 'afiliados' : 'afiliacao'}`}
        onExportAll={exportAllNetwork}
        columns={columns}
        rows={active.rows}
        getRowKey={row => row.id}
        loading={loading}
        pagination={active.pagination}
        onPageChange={setPage}
        onLimitChange={newLimit => {
          setLimit(newLimit)
          setPage(1)
        }}
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSortChange={handleSortChange}
        emptyTitle={group === 'guests' ? 'Usuário sem afiliados no momento' : 'Usuário sem afiliação no momento'}
      />
    </Box>
  )
}
