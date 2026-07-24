'use client'

import { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PlusIcon from 'mdi-material-ui/Plus'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import { fetchAllPages } from '@/components/data-table/export'
import { StatusBadge, booleanStatusToBadge } from '@/components/ui/StatusBadge'
import { useHasPermission, useSession } from '@/components/shell/SessionContext'
import { toast } from '@/components/ui/toast'
import type { PaginationMeta, SortParams } from '@/domain/dtos/common.dto'
import type { StaffListItem } from '@/domain/dtos/staff.dto'
import { listStaffAction } from './team.actions'
import { TeamRowActions } from './TeamRowActions'

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 1 }

export function TeamList() {
  const { id: currentStaffId } = useSession()
  const canManageRoles = useHasPermission('roles.manage')
  const [rows, setRows] = useState<StaffListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [sort, setSort] = useState<SortParams>({})

  const fetchStaff = useCallback(() => {
    setLoading(true)
    listStaffAction({ page, limit, ...sort })
      .then(result => {
        setRows(result.data)
        setPagination(result.pagination)
      })
      .catch(() => toast.error('Não foi possível carregar a equipe.'))
      .finally(() => setLoading(false))
  }, [page, limit, sort])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  function handleSortChange(column: string) {
    setSort(current => ({
      sortBy: column,
      sortDirection: current.sortBy === column && current.sortDirection === 'asc' ? 'desc' : 'asc'
    }))
    setPage(1)
  }

  function exportAllStaff() {
    return fetchAllPages((page, limit) => listStaffAction({ page, limit, ...sort }))
  }

  const columns: DataTableColumn<StaffListItem>[] = [
    { key: 'id', label: 'ID', width: 72, sortable: true },
    { key: 'name', label: 'Nome', sortable: true, render: row => `${row.name} ${row.surname}` },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'roleName', label: 'Papel', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: row => {
        const { label, tone } = booleanStatusToBadge(Boolean(row.isActive))
        return <StatusBadge label={label} tone={tone} />
      },
      exportValue: row => booleanStatusToBadge(Boolean(row.isActive)).label
    },
    {
      key: 'createdAt',
      label: 'Desde',
      sortable: true,
      render: row => new Date(row.createdAt).toLocaleDateString('pt-BR')
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant='h1'>Equipe</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {canManageRoles && (
            <Button
              intent='ghost'
              component={NextLink}
              href='/team/roles'
              startIcon={<AccountCogOutline fontSize='small' />}
            >
              Gerenciar papéis
            </Button>
          )}
          <Button intent='primary' component={NextLink} href='/team/create' startIcon={<PlusIcon fontSize='small' />}>
            Novo staff
          </Button>
        </Box>
      </Box>

      <DataTable
        ariaLabel='Equipe'
        exportFilenameBase='equipe'
        onExportAll={exportAllStaff}
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
        sortBy={sort.sortBy}
        sortDirection={sort.sortDirection}
        onSortChange={handleSortChange}
        emptyTitle='Nenhum staff encontrado'
        rowActions={row => (
          <TeamRowActions
            staffId={row.id}
            staffName={`${row.name} ${row.surname}`}
            isActive={Boolean(row.isActive)}
            isSelf={row.id === currentStaffId}
            onChanged={fetchStaff}
          />
        )}
      />
    </Box>
  )
}
