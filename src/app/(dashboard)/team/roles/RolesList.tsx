'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PlusIcon from 'mdi-material-ui/Plus'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import { PERMISSION_LABELS, type Permission } from '@/domain/permissions'
import type { Role } from '@/domain/dtos/roles.dto'
import { listRolesAction } from './roles.actions'
import { RoleRowActions } from './RoleRowActions'

/** `GET /api/roles` não aceita `sortBy`/`sortDirection` (nunca paginou — ver comentário abaixo) — ordenação aqui é só em memória, sobre os dados já carregados. */
function getSortValue(row: Role, column: string): string | number {
  switch (column) {
    case 'name':
      return row.name.toLowerCase()
    case 'description':
      return (row.description ?? '').toLowerCase()
    case 'isSystem':
      return row.isSystem ? 1 : 0
    default:
      return ''
  }
}

/**
 * `GET /api/roles` nunca paginou (parte 4 — escala deste recurso é pequena
 * por design, um catálogo fixo de 6 permissões). `DataTable` continua sendo
 * reaproveitada mesmo assim (loading/empty-state/estilo consistentes com o
 * resto do painel), só com uma "paginação" de página única sintética.
 */
export function RolesList() {
  const [rows, setRows] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const fetchRoles = useCallback(() => {
    setLoading(true)
    listRolesAction()
      .then(setRows)
      .catch(() => toast.error('Não foi possível carregar os papéis.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  function handleSortChange(column: string) {
    setSortDirection(current => (sortBy === column && current === 'asc' ? 'desc' : 'asc'))
    setSortBy(column)
  }

  const sortedRows = useMemo(() => {
    if (!sortBy) return rows
    const direction = sortDirection === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => {
      const left = getSortValue(a, sortBy)
      const right = getSortValue(b, sortBy)
      if (left < right) return -1 * direction
      if (left > right) return 1 * direction
      return 0
    })
  }, [rows, sortBy, sortDirection])

  const columns: DataTableColumn<Role>[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'description', label: 'Descrição', sortable: true, render: row => row.description || '—' },
    {
      key: 'permissions',
      label: 'Permissões',
      render: row =>
        row.permissions.length
          ? row.permissions.map(permission => PERMISSION_LABELS[permission as Permission] ?? permission).join(', ')
          : 'Nenhuma'
    },
    {
      key: 'isSystem',
      label: 'Sistema',
      sortable: true,
      render: row => (row.isSystem ? <StatusBadge label='Sistema' tone='info' /> : null),
      exportValue: row => (row.isSystem ? 'Sistema' : '')
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant='h1'>Papéis</Typography>
        <Button
          intent='primary'
          component={NextLink}
          href='/team/roles/create'
          startIcon={<PlusIcon fontSize='small' />}
        >
          Novo papel
        </Button>
      </Box>

      <DataTable
        ariaLabel='Papéis'
        exportFilenameBase='papeis'
        onExportAll={() => Promise.resolve(sortedRows)}
        columns={columns}
        rows={sortedRows}
        getRowKey={row => row.id}
        loading={loading}
        pagination={{ page: 1, limit: Math.max(rows.length, 1), total: rows.length, totalPages: 1 }}
        onPageChange={() => {}}
        rowsPerPageOptions={[Math.max(rows.length, 1)]}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        emptyTitle='Nenhum papel encontrado'
        rowActions={row => (
          <RoleRowActions roleId={row.id} roleName={row.name} isSystem={row.isSystem} onChanged={fetchRoles} />
        )}
      />
    </Box>
  )
}
