'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { Button } from '@/components/ui/Button'
import { DemoGuard } from '@/components/ui/DemoGuard'
import { toast } from '@/components/ui/toast'
import { updateStaffPasswordAction } from './account-settings.actions'

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Campo obrigatório'),
    newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
    confirmNewPassword: z.string().min(1, 'Campo obrigatório')
  })
  .refine(values => values.newPassword === values.confirmNewPassword, {
    message: 'As senhas digitadas não coincidem',
    path: ['confirmNewPassword']
  })

type SecurityFormValues = z.infer<typeof securityFormSchema>

export function SecurityForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  })

  async function onSubmit(values: SecurityFormValues) {
    try {
      await updateStaffPasswordAction({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      toast.success('Senha atualizada com sucesso!')
      reset()
    } catch (error) {
      // Erros lançados numa Server Action chegam ao cliente como `Error`
      // simples (a classe original, `BackendApiError`, não atravessa a
      // fronteira) — mas a `message` sobrevive, e aqui vale a pena mostrá-la
      // (ex.: "senha atual não corresponde"), diferente do padrão genérico
      // usado em outros formulários deste painel.
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar a senha.')
    }
  }

  return (
    <Grid component='form' noValidate onSubmit={handleSubmit(onSubmit)} container spacing={3} sx={{ p: 3 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='currentPassword'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Senha atual'
              type='password'
              fullWidth
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} />
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='newPassword'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Nova senha'
              type='password'
              fullWidth
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='confirmNewPassword'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Repetir nova senha'
              type='password'
              fullWidth
              error={Boolean(errors.confirmNewPassword)}
              helperText={errors.confirmNewPassword?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
        <DemoGuard reason='Trocar a senha está desabilitado na demonstração — a conta de visitante é compartilhada.'>
          <Button type='submit' intent='primary' loading={isSubmitting}>
            Salvar alterações
          </Button>
        </DemoGuard>
      </Grid>
    </Grid>
  )
}
