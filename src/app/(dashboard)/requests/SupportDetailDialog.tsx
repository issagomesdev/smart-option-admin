'use client'

import NextLink from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { SupportItem } from '@/domain/dtos/requests.dto'

export interface SupportDetailDialogProps {
  item: SupportItem | null
  onClose: () => void
}

export function SupportDetailDialog({ item, onClose }: SupportDetailDialogProps) {
  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title={item ? (item.type === 'support' ? 'Suporte técnico' : 'Adesão de serviço') : ''}
      maxWidth='xs'
      actions={
        <>
          {item && (
            <Button intent='secondary' component={NextLink} href={`/users/${item.user_id}`}>
              Ver perfil do usuário
            </Button>
          )}
          <Button intent='ghost' onClick={onClose}>
            Fechar
          </Button>
        </>
      }
    >
      {item && (
        <Stack spacing={1}>
          <Typography variant='body2' color='text.secondary'>
            {item.name}
          </Typography>
          <Typography variant='body1'>{item.subject}</Typography>
        </Stack>
      )}
    </Modal>
  )
}
