'use client'

import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteOutline from '@mui/icons-material/DeleteOutlined'
import InboxOutlined from '@mui/icons-material/InboxOutlined'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import {
  StatusBadge,
  checkoutStatusToBadge,
  withdrawalStatusToBadge,
  booleanStatusToBadge
} from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable'
import type { CheckoutStatus, WithdrawalStatus } from '@/domain/dtos/requests.dto'

const CHECKOUT_STATUSES: CheckoutStatus[] = ['PENDING', 'AUTHORIZED', 'PAID', 'IN_ANALYSIS', 'DECLINED', 'CANCELED']
const WITHDRAWAL_STATUSES: WithdrawalStatus[] = ['pending', 'authorized', 'success', 'refused', 'failed']

interface MockRow {
  id: number
  name: string
  email: string
  status: WithdrawalStatus
}

const MOCK_ROWS: MockRow[] = [
  { id: 1, name: 'Ana Beatriz', email: 'ana@example.com', status: 'pending' },
  { id: 2, name: 'Carlos Silva', email: 'carlos@example.com', status: 'authorized' },
  { id: 3, name: 'Débora Reis', email: 'debora@example.com', status: 'success' },
  { id: 4, name: 'Eduardo Lima', email: 'eduardo@example.com', status: 'refused' }
]

export default function DesignSystemPreviewPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(2)
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [nameFilter, setNameFilter] = useState('')
  const [tableLoading, setTableLoading] = useState(false)
  const [showEmptyDemo, setShowEmptyDemo] = useState(false)

  const filteredRows = useMemo(() => {
    const filtered = MOCK_ROWS.filter(row => row.name.toLowerCase().includes(nameFilter.toLowerCase()))
    const sorted = [...filtered].sort((a, b) => {
      const result = a[sortBy as keyof MockRow] > b[sortBy as keyof MockRow] ? 1 : -1
      return sortDirection === 'asc' ? result : -result
    })
    return sorted
  }, [nameFilter, sortBy, sortDirection])

  const pageRows = showEmptyDemo ? [] : filteredRows.slice((page - 1) * limit, (page - 1) * limit + limit)

  const columns: DataTableColumn<MockRow>[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail' },
    {
      key: 'status',
      label: 'Status',
      render: row => {
        const { label, tone } = withdrawalStatusToBadge(row.status)
        return <StatusBadge label={label} tone={tone} />
      }
    }
  ]

  function simulateReload() {
    setTableLoading(true)
    setTimeout(() => setTableLoading(false), 600)
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Box>
        <Typography variant='h1' gutterBottom>
          Design System — Smart Option Admin
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Preview interno (Fase 3) dos componentes primitivos que a Fase 4 usa para reconstruir as telas. Não faz parte
          da navegação do painel — só uma página de referência viva.
        </Typography>
      </Box>

      <Card title='Button' subtitle='4 intenções — sem produto cartesiano de variant×color'>
        <Stack direction='row' spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button intent='primary'>Primary</Button>
          <Button intent='secondary'>Secondary</Button>
          <Button intent='danger'>Danger</Button>
          <Button intent='ghost'>Ghost</Button>
          <Button intent='primary' disabled>
            Disabled
          </Button>
          <Button intent='primary' loading>
            Loading
          </Button>
        </Stack>
      </Card>

      <Card
        title='StatusBadge'
        subtitle='Os dois vocabulários reais do backend — checkout e saque — mais o booleano genérico'
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              checkouts.status
            </Typography>
            <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {CHECKOUT_STATUSES.map(status => {
                const { label, tone } = checkoutStatusToBadge(status)
                return <StatusBadge key={status} label={label} tone={tone} />
              })}
            </Stack>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              withdrawals.status
            </Typography>
            <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {WITHDRAWAL_STATUSES.map(status => {
                const { label, tone } = withdrawalStatusToBadge(status)
                return <StatusBadge key={status} label={label} tone={tone} />
              })}
            </Stack>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              booleano (is_active, etc.)
            </Typography>
            <Stack direction='row' spacing={1}>
              <StatusBadge {...booleanStatusToBadge(true)} />
              <StatusBadge {...booleanStatusToBadge(false)} />
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Card title='ConfirmDialog' subtitle='Substitui window.confirm() para ações destrutivas'>
        <Button intent='danger' onClick={() => setConfirmOpen(true)}>
          Excluir usuário
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          title='Excluir usuário?'
          description='Essa ação não pode ser desfeita. O usuário e todos os dados associados serão removidos permanentemente.'
          confirmLabel='Excluir'
          tone='danger'
          loading={confirmLoading}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmLoading(true)
            setTimeout(() => {
              setConfirmLoading(false)
              setConfirmOpen(false)
              toast.success('Usuário excluído com sucesso (demo)')
            }, 800)
          }}
        />
      </Card>

      <Card title='Toast' subtitle='react-toastify com opções padronizadas'>
        <Stack direction='row' spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button intent='secondary' onClick={() => toast.success('Operação concluída com sucesso!')}>
            success
          </Button>
          <Button intent='secondary' onClick={() => toast.error('Algo deu errado.')}>
            error
          </Button>
          <Button intent='secondary' onClick={() => toast.info('Só um aviso.')}>
            info
          </Button>
          <Button intent='secondary' onClick={() => toast.warning('Atenção com isso.')}>
            warning
          </Button>
        </Stack>
      </Card>

      <Card title='LoadingScreen' subtitle='Variante inline (fullPage=false)'>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <LoadingScreen fullPage={false} label='Carregando dados...' />
        </Box>
      </Card>

      <Card title='EmptyState'>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <EmptyState
            icon={<InboxOutlined fontSize='inherit' />}
            title='Nenhuma solicitação encontrada'
            description='Ajuste os filtros ou aguarde novas solicitações chegarem.'
          />
        </Box>
      </Card>

      <Card title='DataTable' subtitle='Paginação/ordenação server-side (aqui simuladas em memória só para o preview)'>
        <Stack spacing={2}>
          <Stack direction='row' spacing={2}>
            <Button intent='ghost' onClick={simulateReload}>
              Simular loading
            </Button>
            <Button intent='ghost' onClick={() => setShowEmptyDemo(value => !value)}>
              {showEmptyDemo ? 'Mostrar dados' : 'Simular vazio'}
            </Button>
          </Stack>
          <DataTable
            ariaLabel='Demonstração'
            columns={columns}
            rows={pageRows}
            getRowKey={row => row.id}
            loading={tableLoading}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={column => {
              if (column === sortBy) {
                setSortDirection(direction => (direction === 'asc' ? 'desc' : 'asc'))
              } else {
                setSortBy(column)
                setSortDirection('asc')
              }
            }}
            pagination={{
              page,
              limit,
              total: showEmptyDemo ? 0 : filteredRows.length,
              totalPages: Math.max(1, Math.ceil(filteredRows.length / limit))
            }}
            onPageChange={setPage}
            onLimitChange={newLimit => {
              setLimit(newLimit)
              setPage(1)
            }}
            rowsPerPageOptions={[2, 5, 10]}
            emptyTitle='Nenhum resultado'
            emptyDescription='Tente outro filtro.'
            toolbar={
              <TextField
                size='small'
                label='Filtrar por nome'
                value={nameFilter}
                onChange={event => {
                  setNameFilter(event.target.value)
                  setPage(1)
                }}
              />
            }
            rowActions={row => (
              <IconButton
                size='small'
                aria-label={`Excluir ${row.name}`}
                onClick={() => toast.info(`Excluir ${row.name} (demo)`)}
              >
                <DeleteOutline fontSize='small' />
              </IconButton>
            )}
          />
        </Stack>
      </Card>
    </Box>
  )
}
