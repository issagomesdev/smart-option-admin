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
import { deleteStaffAction } from './team.actions'

/**
 * Administrador principal — a conta semeada com que o painel é instalado. O backend recusa a
 * exclusão incondicionalmente (`PROTECTED_STAFF_ID` em `staff.service.ts`); esconder a ação aqui
 * evita um 403 garantido, mas a garantia real continua sendo do backend.
 */
const PROTECTED_STAFF_ID = 1

export interface TeamRowActionsProps {
  staffId: number
  staffName: string
  /** O backend recusa incondicionalmente a auto-exclusão — esconder a ação evita um 403 garantido. */
  isSelf: boolean
  onChanged: () => void
}

export function TeamRowActions({ staffId, staffName, isSelf, onChanged }: TeamRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canDelete = !isSelf && staffId !== PROTECTED_STAFF_ID

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteStaffAction(staffId)
      toast.success('Colaborador excluído com sucesso')
      setConfirmOpen(false)
      onChanged()
    } catch {
      toast.error('Não foi possível excluir o colaborador.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack direction='row' spacing={0.5}>
      <Tooltip title='Editar'>
        <IconButton size='small' aria-label={`Editar ${staffName}`} component={NextLink} href={`/team/${staffId}/edit`}>
          <PencilOutline fontSize='small' />
        </IconButton>
      </Tooltip>

      {canDelete && (
        <Tooltip title='Excluir'>
          <IconButton size='small' aria-label={`Excluir ${staffName}`} onClick={() => setConfirmOpen(true)}>
            <DeleteOutline fontSize='small' />
          </IconButton>
        </Tooltip>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title='Excluir colaborador?'
        description={`"${staffName}" será removido definitivamente e perde o acesso ao painel imediatamente. As ações que ele já realizou continuam na trilha de auditoria. Essa ação não pode ser desfeita.`}
        confirmLabel='Excluir'
        tone='danger'
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
