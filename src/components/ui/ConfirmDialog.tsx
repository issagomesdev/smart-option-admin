import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { Button } from './Button'
import { Modal } from './Modal'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` para ações destrutivas (excluir, bloquear) — troca o botão de confirmar para vermelho. */
  tone?: 'default' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Substitui o `window.confirm()` nativo usado hoje para excluir/bloquear
 * usuário (achado da auditoria — quebra o resto da UI, sem estilo, sem
 * suporte a texto rico). Foco e `Esc` já vêm do `Modal`/`MuiDialog` por baixo.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  loading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidth='xs'
      actions={
        <>
          <Button intent='ghost' onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button intent={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && (
        <Typography variant='body2' color='text.secondary'>
          {description}
        </Typography>
      )}
    </Modal>
  )
}
