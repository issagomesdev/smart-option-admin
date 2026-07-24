'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { DataTableColumn } from '@/components/data-table/DataTable'
import { DataTable } from '@/components/data-table/DataTable'
import { toast } from '@/components/ui/toast'
import type { ExtractItem } from '@/domain/dtos/requests.dto'
import { getExtractAction } from './requests.actions'

const ORIGIN_LABELS: Record<string, string> = {
  deposit: 'Depósito',
  withdrawal: 'Saque',
  subscription: 'Adesão',
  tuition: 'Mensalidade',
  earnings: 'Rentabilidade',
  profitability: 'Bônus de Rentabilidade',
  'B.A': 'Bônus de Adesão',
  'B.M': 'Bônus de Mensalidade',
  transfer: 'Transf. entre contas',
  admin: 'Transf. ADM',
  diamond_tax: 'Taxa Diamante'
}

export interface ExtractTableProps {
  userId: number
}

export function ExtractTable({ userId }: ExtractTableProps) {
  const [rows, setRows] = useState<ExtractItem[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ value: '', origin: 'all', created_at: '' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    setLoading(true)
    getExtractAction(userId, filters)
      .then(result => {
        setRows(result.extract)
        setBalance(result.balance)
      })
      .catch(() => toast.error('Não foi possível carregar o extrato.'))
      .finally(() => setLoading(false))
  }, [userId, filters])

  function updateFilter<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    setFilters(values => ({ ...values, [key]: value }))
    setPage(1)
  }

  const columns: DataTableColumn<ExtractItem>[] = [
    { key: 'id', label: 'ID', width: 72 },
    {
      key: 'value',
      label: 'Valor',
      align: 'right',
      render: row => `${row.type === 'sum' ? '+' : '-'} R$ ${Number(row.value).toFixed(2)}`
    },
    { key: 'origin', label: 'Origem', render: row => ORIGIN_LABELS[row.origin] ?? row.origin },
    { key: 'created_at', label: 'Data' }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='subtitle1'>Saldo atual: R$ {balance.toFixed(2)}</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3, md: 3 }}>
          <TextField
            label='Valor'
            size='small'
            fullWidth
            value={filters.value}
            onChange={event => updateFilter('value', event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 4 }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='extract-origin-label'>Origem</InputLabel>
            <Select
              labelId='extract-origin-label'
              label='Origem'
              value={filters.origin}
              onChange={event => updateFilter('origin', event.target.value)}
            >
              <MenuItem value='all'>Todos</MenuItem>
              {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3 }}>
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

      {/* `RequestService.extract` não pagina no servidor (fora de escopo da
          Fase 0) — a paginação aqui é só a janela de exibição sobre a lista
          completa já carregada, não uma nova busca por página. Por isso
          `onExportAll` não precisa de `fetchAllPages`: `rows` já é a lista
          inteira que bate o filtro atual, sem busca extra ao backend. */}
      <DataTable
        ariaLabel='Extrato'
        exportFilenameBase='extrato'
        onExportAll={() => Promise.resolve(rows)}
        columns={columns}
        rows={rows.slice((page - 1) * limit, page * limit)}
        getRowKey={row => row.id}
        loading={loading}
        pagination={{ page, limit, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)) }}
        onPageChange={setPage}
        onLimitChange={newLimit => {
          setLimit(newLimit)
          setPage(1)
        }}
        emptyTitle='Nenhuma movimentação encontrada'
      />
    </Box>
  )
}
