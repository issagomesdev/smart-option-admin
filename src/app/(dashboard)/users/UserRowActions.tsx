'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CashSync from 'mdi-material-ui/CashSync'
import DeleteOutline from 'mdi-material-ui/DeleteOutline'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useHasPermission } from '@/components/shell/SessionContext'
import { toast } from '@/components/ui/toast'
import { deleteBotUserAction } from './users.actions'

export interface UserRowActionsProps {
  userId: number
  userName: string
  onDeleted: () => void
  onTransfer: (userId: number) => void
}

export function UserRowActions({ userId, userName, onDeleted, onTransfer }: UserRowActionsProps) {
  const canWrite = useHasPermission('users.write')
  const canAdjustFinance = useHasPermission('finance.adjust')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteBotUserAction(userId)
      toast.success('Usuário excluído com sucesso')
      setConfirmOpen(false)
      onDeleted()
    } catch {
      toast.error('Não foi possível excluir o usuário.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <IconButton size='small' aria-label={`Ações de ${userName}`} onClick={event => setAnchorEl(event.currentTarget)}>
        <DotsVertical fontSize='small' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem component={NextLink} href={`/users/${userId}`} onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <EyeOutline fontSize='small' />
          </ListItemIcon>
          Visualizar
        </MenuItem>
        {canWrite && (
          <MenuItem component={NextLink} href={`/users/${userId}/edit`} onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <PencilOutline fontSize='small' />
            </ListItemIcon>
            Editar
          </MenuItem>
        )}
        {canAdjustFinance && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              onTransfer(userId)
            }}
          >
            <ListItemIcon>
              <CashSync fontSize='small' />
            </ListItemIcon>
            Ajustar saldo
          </MenuItem>
        )}
        {canWrite && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              setConfirmOpen(true)
            }}
          >
            <ListItemIcon>
              <DeleteOutline fontSize='small' />
            </ListItemIcon>
            Excluir
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={confirmOpen}
        title='Excluir usuário?'
        description={`"${userName}" e todos os dados associados serão removidos permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel='Excluir'
        tone='danger'
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
