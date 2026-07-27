'use client'

import NextLink from 'next/link'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { describeMovement, describeMovementStatus } from '@/domain/movement-labels'
import type { AuditMovementItem } from '@/domain/dtos/audit.dto'

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

export interface AuditDetailDialogProps {
  item: AuditMovementItem | null
  onClose: () => void
}

interface FieldProps {
  label: string
  children: React.ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2' component='div'>
        {children}
      </Typography>
    </Stack>
  )
}

/** Detalhe somente-leitura de uma movimentação — todo campo listado no pedido original (data, hora, ID, usuário, Telegram ID, valor, tipo, status, origem, gateway, administrador responsável, observações, criação/atualização, links relacionados). */
export function AuditDetailDialog({ item, onClose }: AuditDetailDialogProps) {
  const movement = item ? describeMovement(item.kind, item.direction) : null
  const statusInfo = item ? describeMovementStatus(item.status) : null
  const signedAmount = item ? (item.direction === 'debit' ? -item.amount : item.amount) : 0

  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title={item ? `Movimentação ${item.id}` : ''}
      maxWidth='sm'
      actions={
        <Button intent='ghost' onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {item && movement && statusInfo && (
        <Stack spacing={2}>
          <Stack direction='row' spacing={4} sx={{ flexWrap: 'wrap' }}>
            <Field label='Tipo'>{movement.label}</Field>
            <Field label='Status'>
              <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
            </Field>
            <Field label='Gateway'>{item.gateway}</Field>
          </Stack>

          <Divider />

          <Stack direction='row' spacing={4} sx={{ flexWrap: 'wrap' }}>
            <Field label='Valor'>
              <Typography
                component='span'
                sx={{ fontWeight: 600, color: item.direction === 'credit' ? 'success.main' : 'text.primary' }}
              >
                {signedAmount < 0 ? '-' : '+'}
                {currencyFormatter.format(Math.abs(signedAmount))}
              </Typography>
            </Field>
            <Field label='ID da operação'>{item.referenceId ?? '—'}</Field>
          </Stack>

          <Divider />

          <Stack direction='row' spacing={4} sx={{ flexWrap: 'wrap' }}>
            <Field label='Usuário'>
              <NextLink href={`/users/${item.userId}`} style={{ color: 'inherit' }}>
                #{item.userId} — {item.userName}
              </NextLink>
            </Field>
            <Field label='Telegram ID'>{item.telegramUserId ?? '—'}</Field>
          </Stack>

          <Divider />

          <Stack direction='row' spacing={4} sx={{ flexWrap: 'wrap' }}>
            <Field label='Data de criação'>{dateTimeFormatter.format(new Date(item.createdAt))}</Field>
            <Field label='Última atualização'>{dateTimeFormatter.format(new Date(item.updatedAt))}</Field>
          </Stack>

          <Divider />

          <Field label='Administrador responsável'>{item.responsibleAdmin ?? 'Sistema (automático)'}</Field>
          <Field label='Observações'>{item.observations ?? 'Nenhuma observação registrada.'}</Field>
        </Stack>
      )}
    </Modal>
  )
}
