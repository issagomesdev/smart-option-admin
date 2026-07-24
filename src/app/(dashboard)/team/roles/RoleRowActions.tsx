'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutline from 'mdi-material-ui/DeleteOutline'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from '@/components/ui/toast'
import { deleteRoleAction } from './roles.actions'

export interface RoleRowActionsProps {
  roleId: number
  roleName: string
  /** Papéis de sistema (`admin`/`staff`) não podem ser excluídos — o backend recusa incondicionalmente; a ação nem aparece aqui. */
  isSystem: boolean
  onChanged: () => void
}

export function RoleRowActions({ roleId, roleName, isSystem, onChanged }: RoleRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteRoleAction(roleId)
      toast.success('Papel excluído com sucesso')
      setConfirmOpen(false)
      onChanged()
    } catch {
      toast.error('Não foi possível excluir o papel. Verifique se ele ainda está atribuído a algum staff.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack direction='row' spacing={0.5}>
      <Tooltip title='Editar'>
        <IconButton
          size='small'
          aria-label={`Editar papel ${roleName}`}
          component={NextLink}
          href={`/team/roles/${roleId}/edit`}
        >
          <PencilOutline fontSize='small' />
        </IconButton>
      </Tooltip>

      {!isSystem && (
        <Tooltip title='Excluir'>
          <IconButton size='small' aria-label={`Excluir papel ${roleName}`} onClick={() => setConfirmOpen(true)}>
            <DeleteOutline fontSize='small' />
          </IconButton>
        </Tooltip>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title='Excluir papel?'
        description={`"${roleName}" será removido permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel='Excluir'
        tone='danger'
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
