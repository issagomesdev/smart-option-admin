'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import AccountOffOutline from 'mdi-material-ui/AccountOffOutline'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from '@/components/ui/toast'
import { deactivateStaffAction } from './team.actions'

export interface TeamRowActionsProps {
  staffId: number
  staffName: string
  isActive: boolean
  /** O backend recusa incondicionalmente auto-desativação — esconder a ação evita um 403 garantido. */
  isSelf: boolean
  onChanged: () => void
}

export function TeamRowActions({ staffId, staffName, isActive, isSelf, onChanged }: TeamRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  async function handleDeactivate() {
    setDeactivating(true)
    try {
      await deactivateStaffAction(staffId)
      toast.success('Staff desativado com sucesso')
      setConfirmOpen(false)
      onChanged()
    } catch {
      toast.error('Não foi possível desativar o staff.')
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <Stack direction='row' spacing={0.5}>
      <Tooltip title='Editar papel'>
        <IconButton
          size='small'
          aria-label={`Editar papel de ${staffName}`}
          component={NextLink}
          href={`/team/${staffId}/edit`}
        >
          <PencilOutline fontSize='small' />
        </IconButton>
      </Tooltip>

      {isActive && !isSelf && (
        <Tooltip title='Desativar'>
          <IconButton size='small' aria-label={`Desativar ${staffName}`} onClick={() => setConfirmOpen(true)}>
            <AccountOffOutline fontSize='small' />
          </IconButton>
        </Tooltip>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title='Desativar staff?'
        description={`"${staffName}" perde o acesso ao painel imediatamente. Essa ação não pode ser desfeita por aqui.`}
        confirmLabel='Desativar'
        tone='danger'
        loading={deactivating}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeactivate}
      />
    </Stack>
  )
}
