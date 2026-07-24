'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/toast'
import { products } from '@/domain/products'
import { getPlansAction } from '../dashboard.actions'
import { createBotUserAction, updateBotUserAction } from './users.actions'
import type { BotUserDetail } from '@/domain/dtos/users.dto'

const userFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório').max(255),
  email: z.email('E-mail inválido'),
  password: z.string().optional(),
  cpf: z.string().optional(),
  phone_number: z.string().min(1, 'Campo obrigatório').max(255),
  adress: z.string().min(1, 'Campo obrigatório').max(255),
  pix_code: z.string().min(1, 'Campo obrigatório').max(255),
  product_id: z.string().optional()
})

type UserFormValues = z.infer<typeof userFormSchema>

export interface UserFormProps {
  mode: 'create' | 'edit'
  userId?: number
  initialValues?: BotUserDetail
}

export function UserForm({ mode, userId, initialValues }: UserFormProps) {
  const router = useRouter()
  const [plans, setPlans] = useState<{ id: number; name: string }[]>([])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      email: initialValues?.email ?? '',
      password: '',
      cpf: '',
      phone_number: initialValues?.phoneNumber ?? '',
      adress: initialValues?.adress ?? '',
      pix_code: initialValues?.pixCode ?? '',
      product_id: initialValues?.productId ? String(initialValues.productId) : ''
    }
  })

  useEffect(() => {
    getPlansAction()
      .then(setPlans)
      .catch(() => toast.error('Não foi possível carregar os planos.'))
  }, [])

  async function onSubmit(values: UserFormValues) {
    try {
      if (mode === 'create') {
        if (!values.password || values.password.length < 6) {
          toast.error('A senha é obrigatória e deve ter pelo menos 6 caracteres.')
          return
        }
        if (!values.cpf) {
          toast.error('O CPF é obrigatório.')
          return
        }

        await createBotUserAction({
          name: values.name,
          email: values.email,
          password: values.password,
          cpf: values.cpf,
          phone_number: values.phone_number,
          adress: values.adress,
          pix_code: values.pix_code,
          product_id: values.product_id ? Number(values.product_id) : undefined
        })
        toast.success('Usuário cadastrado com sucesso')
      } else {
        if (!userId) return

        await updateBotUserAction({
          id: userId,
          name: values.name,
          email: values.email,
          password: values.password || undefined,
          phone_number: values.phone_number,
          adress: values.adress,
          pix_code: values.pix_code,
          product_id: values.product_id ? Number(values.product_id) : undefined
        })
        toast.success('Usuário atualizado com sucesso')
      }

      // Só `push`, sem `router.refresh()` — chamar as duas em sequência aqui
      // (destino diferente da origem) trava a navegação: a nova rota já busca
      // dados frescos via Server Action no próprio efeito da listagem, então
      // o refresh manual era redundante e, pior, cancelava o `push` (RSC
      // request nunca completava, URL nunca mudava — reproduzido e confirmado
      // manualmente antes desta correção).
      router.push('/users')
    } catch {
      toast.error(mode === 'create' ? 'Não foi possível cadastrar o usuário.' : 'Não foi possível atualizar o usuário.')
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
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={mode === 'create' ? 'Senha' : 'Nova senha (opcional)'}
              type='password'
              fullWidth
              helperText={mode === 'edit' ? 'Deixe em branco para manter a senha atual' : undefined}
            />
          )}
        />
      </Grid>
      {mode === 'create' && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='cpf'
            control={control}
            render={({ field }) => <TextField {...field} label='CPF' fullWidth />}
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='phone_number'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Telefone'
              fullWidth
              error={Boolean(errors.phone_number)}
              helperText={errors.phone_number?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='adress'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Endereço'
              fullWidth
              error={Boolean(errors.adress)}
              helperText={errors.adress?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='pix_code'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Chave Pix'
              fullWidth
              error={Boolean(errors.pix_code)}
              helperText={errors.pix_code?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='product_id'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id='user-form-plan-label'>Plano</InputLabel>
              <Select {...field} labelId='user-form-plan-label' label='Plano'>
                <MenuItem value=''>Nenhum</MenuItem>
                {plans.map(plan => (
                  <MenuItem key={plan.id} value={String(plan.id)}>
                    {products[plan.name] ?? plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
        <Button type='submit' intent='primary' loading={isSubmitting}>
          {mode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
        </Button>
        <Button intent='ghost' onClick={() => router.push('/users')}>
          Cancelar
        </Button>
      </Grid>
    </Grid>
  )
}
