'use client'

import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_ACTION_LABELS,
  type AuditActionItem,
  type AuditActionValue
} from '@/domain/dtos/audit-actions.dto'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

export interface AuditActionDetailDialogProps {
  item: AuditActionItem | null
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

/** Rótulos legíveis para as chaves gravadas no JSON — evita expor `pixCode`/`passwordChanged` crus. */
const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  surname: 'Sobrenome',
  email: 'E-mail',
  phoneNumber: 'Telefone',
  adress: 'Endereço',
  pixCode: 'Chave PIX',
  passwordChanged: 'Senha redefinida',
  isActive: 'Ativo',
  roleId: 'Papel (ID)',
  roleName: 'Papel',
  permissions: 'Permissões',
  amount: 'Valor',
  balanceAfter: 'Saldo depois',
  observation: 'Observação',
  transactionId: 'ID da transação',
  productId: 'Plano (ID)',
  telegramUserId: 'Telegram ID',
  isRead: 'Concluído',
  description: 'Descrição'
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Nenhuma'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** `actorEmail` é metadado do autor, já exibido em "Autor" — não repetir na lista de campos. */
function readableEntries(payload: unknown): [string, unknown][] {
  if (!payload || typeof payload !== 'object') return []
  return Object.entries(payload as Record<string, unknown>).filter(([key]) => key !== 'actorEmail')
}

export function AuditActionDetailDialog({ item, onClose }: AuditActionDetailDialogProps) {
  const before = readableEntries(item?.before)
  const after = readableEntries(item?.after)

  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title={item ? (AUDIT_ACTION_LABELS[item.action as AuditActionValue] ?? item.action) : ''}
      maxWidth='sm'
      actions={
        <Button intent='ghost' onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {item && (
        <Stack spacing={2}>
          <Stack direction='row' spacing={4} sx={{ flexWrap: 'wrap' }}>
            <Field label='Data'>{dateTimeFormatter.format(new Date(item.createdAt))}</Field>
            <Field label='Área'>{AUDIT_ACTION_GROUPS[item.entityType] ?? item.entityType}</Field>
            <Field label='Registro'>{item.entityId ? `#${item.entityId}` : '—'}</Field>
          </Stack>

          <Divider />

          <Field label='Autor'>
            {item.actorName ?? 'Conta removida'}
            {item.actorEmail ? ` — ${item.actorEmail}` : ''}
          </Field>

          {before.length > 0 && (
            <>
              <Divider />
              <Field label='Antes'>
                <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                  {before.map(([key, value]) => (
                    <Typography key={key} variant='body2' color='text.secondary'>
                      {FIELD_LABELS[key] ?? key}: {formatValue(value)}
                    </Typography>
                  ))}
                </Stack>
              </Field>
            </>
          )}

          {after.length > 0 && (
            <>
              <Divider />
              <Field label='Depois'>
                <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                  {after.map(([key, value]) => (
                    <Typography key={key} variant='body2'>
                      {FIELD_LABELS[key] ?? key}: {formatValue(value)}
                    </Typography>
                  ))}
                </Stack>
              </Field>
            </>
          )}
        </Stack>
      )}
    </Modal>
  )
}
