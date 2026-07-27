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
import { deletePlanAction } from './plans.actions'

export interface PlanRowActionsProps {
  planId: number
  planName: string
  /** Plano semeado — o backend recusa a exclusão incondicionalmente, então a ação nem aparece. */
  isSystem: boolean
  /** Plano já adquirido por alguém — também não pode ser excluído (histórico em `users_plans`). */
  subscriberCount: number
  onChanged: () => void
}

export function PlanRowActions({ planId, planName, isSystem, subscriberCount, onChanged }: PlanRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Espelha as duas recusas de `PlansService.delete`. Esconder o botão aqui é só UX — quem garante
  // é o backend, que responde 409 mesmo se alguém chamar a API direto.
  const canDelete = !isSystem && subscriberCount === 0

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletePlanAction(planId)
      toast.success('Plano excluído com sucesso')
      setConfirmOpen(false)
      onChanged()
    } catch {
      // Mensagem estática com a dica das duas regras possíveis, e não a do backend: um erro lançado
      // dentro de uma Server Action não atravessa a fronteira RSC como `BackendApiError` — o Next.js
      // o substitui por um `Error` genérico (e redige a mensagem em produção). Mesmo motivo pelo
      // qual `RoleRowActions` também usa texto fixo aqui.
      toast.error('Não foi possível excluir o plano. Planos do sistema ou já adquiridos não podem ser removidos.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack direction='row' spacing={0.5}>
      <Tooltip title='Editar'>
        <IconButton
          size='small'
          aria-label={`Editar plano ${planName}`}
          component={NextLink}
          href={`/plans/${planId}/edit`}
        >
          <PencilOutline fontSize='small' />
        </IconButton>
      </Tooltip>

      {canDelete && (
        <IconButton size='small' aria-label={`Excluir plano ${planName}`} onClick={() => setConfirmOpen(true)}>
          <DeleteOutline fontSize='small' />
        </IconButton>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title='Excluir plano?'
        description={`"${planName}" será removido permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel='Excluir'
        tone='danger'
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
