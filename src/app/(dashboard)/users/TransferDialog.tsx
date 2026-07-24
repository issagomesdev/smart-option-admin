'use client'

import { useState } from 'react'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/toast'
import { transferValuesAction } from './users.actions'

export interface TransferDialogProps {
  userId: number | null
  onClose: () => void
  onDone: () => void
}

export function TransferDialog({ userId, onClose, onDone }: TransferDialogProps) {
  const [type, setType] = useState<'sum' | 'subtract'>('sum')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!userId || !value) {
      toast.error('Preencha o valor.')
      return
    }

    setLoading(true)
    try {
      await transferValuesAction({ user_id: userId, value, type })
      toast.success('Saldo atualizado com sucesso')
      setValue('')
      onDone()
    } catch {
      toast.error('Não foi possível atualizar o saldo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={userId !== null}
      onClose={onClose}
      title='Ajustar saldo do usuário'
      maxWidth='xs'
      actions={
        <>
          <Button intent='ghost' onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button intent='primary' onClick={handleSubmit} loading={loading}>
            Enviar
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant='body2' color='text.secondary'>
          Usuário #{userId}
        </Typography>
        <Stack direction='row' spacing={1}>
          <FormControl size='small' sx={{ width: 90 }}>
            <Select value={type} onChange={event => setType(event.target.value as 'sum' | 'subtract')}>
              <MenuItem value='sum'>+ Somar</MenuItem>
              <MenuItem value='subtract'>− Subtrair</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label='Valor'
            type='number'
            size='small'
            fullWidth
            value={value}
            onChange={event => setValue(event.target.value)}
          />
        </Stack>
      </Stack>
    </Modal>
  )
}
