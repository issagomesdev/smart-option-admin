'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useHasPermission, useIsDemo } from '@/components/shell/SessionContext'
import { StatusBadge, withdrawalStatusToBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/toast'
import type { WithdrawalItem } from '@/domain/dtos/requests.dto'
import { resolveWithdrawalAction } from './requests.actions'

export interface RespondWithdrawalDialogProps {
  item: WithdrawalItem | null
  onClose: () => void
  onDone: () => void
}

export function RespondWithdrawalDialog({ item, onClose, onDone }: RespondWithdrawalDialogProps) {
  const canApprove = useHasPermission('withdrawals.approve')
  const isDemo = useIsDemo()
  const [observation, setObservation] = useState('')
  const [loading, setLoading] = useState(false)

  function handleClose() {
    setObservation('')
    onClose()
  }

  async function respond(res: boolean) {
    if (!item) return

    setLoading(true)
    try {
      const result = await resolveWithdrawalAction({ id: item.id, res, observation: observation || undefined })
      if (result.status) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setObservation('')
      onDone()
    } catch {
      toast.error('Não foi possível responder à solicitação.')
    } finally {
      setLoading(false)
    }
  }

  const isPending = item?.status === 'pending'
  // Um saque pendente só é "respondível" de fato se o staff tiver a
  // permissão — sem ela, a experiência é a mesma de uma solicitação já
  // respondida (só leitura), mesmo o status ainda sendo "pending" no banco.
  //
  // Na demonstração vale o mesmo: aprovar dispara uma transferência PIX real na Asaas, então o
  // backend recusa (`denyInDemo` em `POST /api/requests/res-withdrawal`) — a UI acompanha para o
  // visitante não clicar e tomar um 403 sem contexto. O aviso abaixo explica o porquê.
  const canRespond = isPending && canApprove && !isDemo
  const statusBadge = item ? withdrawalStatusToBadge(item.status) : null
  const errors: { description: string }[] | null = item?.errors_cause ? JSON.parse(item.errors_cause) : null

  return (
    <Modal
      open={item !== null}
      onClose={handleClose}
      title={item ? `Solicitação de saque #${item.id}` : ''}
      maxWidth='xs'
      actions={
        canRespond ? (
          <>
            <Button intent='ghost' onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button intent='danger' onClick={() => respond(false)} loading={loading}>
              Rejeitar
            </Button>
            <Button intent='primary' onClick={() => respond(true)} loading={loading}>
              Autorizar
            </Button>
          </>
        ) : (
          <Button intent='ghost' onClick={handleClose}>
            Fechar
          </Button>
        )
      }
    >
      {item && statusBadge && (
        <Stack spacing={2}>
          <Typography variant='body2' color='text.secondary'>
            Valor: R$ {Number(item.value).toFixed(2)}
          </Typography>
          <StatusBadge label={statusBadge.label} tone={statusBadge.tone} />

          {canRespond ? (
            <TextField
              label='Observações'
              multiline
              rows={4}
              fullWidth
              value={observation}
              onChange={event => setObservation(event.target.value)}
            />
          ) : (
            <Stack spacing={1}>
              {errors && (
                <Typography variant='body2' color='error'>
                  Detalhes: {errors.map(error => error.description).join(', ')}
                </Typography>
              )}
              <Typography variant='body2'>
                {isPending
                  ? isDemo
                    ? 'Esta ação está desabilitada na demonstração. Aprovar um saque dispara uma transferência PIX real.'
                    : 'Você não tem permissão para responder a esta solicitação.'
                  : `Observação: ${item.reply_observation || 'Nenhuma observação foi incluída na resposta à solicitação.'}`}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </Modal>
  )
}
