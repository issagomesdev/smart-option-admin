import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { describeMovement, describeMovementStatus } from '@/domain/movement-labels'
import type { MovementRow } from '@/domain/dtos/dashboard.dto'

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

export interface RecentMovementsTableProps {
  movements: MovementRow[]
}

/**
 * Prévia fixa das 10 movimentações mais recentes — sem paginação/ordenação (o `DataTable` do design
 * system pressupõe as duas coisas server-side; forçar isso aqui, numa lista fixa de tamanho 10, só
 * mostraria um paginador que nunca faz nada). "Ver todas" leva pra Auditoria Financeira, que tem o
 * histórico completo com filtros de verdade.
 */
export function RecentMovementsTable({ movements }: RecentMovementsTableProps) {
  return (
    <Stack spacing={2}>
      {movements.length === 0 ? (
        <EmptyState title='Nenhuma movimentação recente' description='Assim que algo acontecer, aparece aqui.' />
      ) : (
        <TableContainer>
          <Table size='small' aria-label='Movimentações recentes'>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align='right'>Valor</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.map(movement => {
                const { label, icon: Icon, color } = describeMovement(movement.kind, movement.direction)
                const { label: statusLabel, tone } = describeMovementStatus(movement.status)
                const signedAmount = movement.direction === 'debit' ? -movement.amount : movement.amount

                return (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ fontSize: 20, color }} aria-hidden />
                        <Typography variant='body2'>{label}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{movement.userName}</TableCell>
                    <TableCell>{dateTimeFormatter.format(new Date(movement.createdAt))}</TableCell>
                    <TableCell align='right'>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: movement.direction === 'credit' ? 'success.main' : 'text.primary'
                        }}
                      >
                        {signedAmount < 0 ? '-' : '+'}
                        {currencyFormatter.format(Math.abs(signedAmount))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge label={statusLabel} tone={tone} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box>
        <Button intent='ghost' component={NextLink} href='/audit'>
          Ver todas
        </Button>
      </Box>
    </Stack>
  )
}
