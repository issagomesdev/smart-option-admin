'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { Button } from '@/components/ui/Button'
import { DemoGuard } from '@/components/ui/DemoGuard'
import { toast } from '@/components/ui/toast'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import { updateStaffUserAction } from './account-settings.actions'

const accountFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório').max(255),
  surname: z.string().min(1, 'Campo obrigatório').max(255),
  email: z.email('E-mail inválido')
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export interface AccountFormProps {
  user: SessionUser
}

export function AccountForm({ user }: AccountFormProps) {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { name: user.name, surname: user.surname, email: user.email }
  })

  async function onSubmit(values: AccountFormValues) {
    try {
      await updateStaffUserAction(values)
      toast.success('Perfil atualizado com sucesso!')
      // Mesma rota, sem navegação — atualiza o nome/e-mail exibidos no menu
      // do usuário (sidebar), que vêm do `getCurrentUser()` do layout.
      router.refresh()
    } catch {
      toast.error('Não foi possível atualizar o perfil.')
    }
  }

  return (
    <Grid component='form' noValidate onSubmit={handleSubmit(onSubmit)} container spacing={3} sx={{ p: 3 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Nome'
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='surname'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Sobrenome'
              fullWidth
              error={Boolean(errors.surname)}
              helperText={errors.surname?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='email'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='E-mail'
              type='email'
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
        <DemoGuard reason='Alterar credenciais administrativas está desabilitado na demonstração.'>
          <Button type='submit' intent='primary' loading={isSubmitting}>
            Salvar alterações
          </Button>
        </DemoGuard>
      </Grid>
    </Grid>
  )
}
