import type { ReactNode } from 'react'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  actions?: ReactNode
  maxWidth?: DialogProps['maxWidth']
}

/** Base acessível para qualquer diálogo do painel — foco preso, `Esc` fecha e `aria-*` corretos vêm de graça do `MuiDialog`. */
export function Modal({ open, onClose, title, children, actions, maxWidth = 'sm' }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
