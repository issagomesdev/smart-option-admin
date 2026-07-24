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
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/toast'
import type { Role } from '@/domain/dtos/roles.dto'
import type { StaffDetail } from '@/domain/dtos/staff.dto'
import { createStaffAction, listRolesAction, reassignStaffRoleAction } from './team.actions'

const teamFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório').max(255).optional(),
  surname: z.string().min(1, 'Campo obrigatório').max(255).optional(),
  email: z.email('E-mail inválido').optional(),
  password: z.string().optional(),
  roleId: z.string().min(1, 'Selecione um papel')
})

type TeamFormValues = z.infer<typeof teamFormSchema>

export interface TeamFormProps {
  mode: 'create' | 'edit'
  staffId?: number
  initialValues?: StaffDetail
}

/**
 * Um só componente para os dois modos, mesmo padrão de `UserForm` — os
 * campos que só existem no modo `create` (nome/sobrenome/e-mail/senha) são
 * opcionais no schema e validados à mão no `onSubmit`, não escondidos atrás
 * de um segundo schema. No modo `edit`, só o papel é editável: nome/
 * sobrenome/e-mail de outro staff não podem ser alterados por aqui —
 * "editar-papel" é literalmente o que `staff.manage` cobre (decisão de
 * design da Fase 5 parte 3); o próprio staff muda os seus em Configurações
 * da conta.
 */
export function TeamForm({ mode, staffId, initialValues }: TeamFormProps) {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    // No modo `edit`, nome/sobrenome/e-mail/senha ficam `undefined` (não `''`)
    // de propósito: são campos `.optional()` no schema, mas uma string vazia
    // ainda é validada contra o `.min(1)` interno — só `undefined` conta como
    // "ausente" para o zod. Sem isso, o submit falharia a validação mesmo
    // sem esses campos aparecerem no formulário.
    defaultValues: {
      name: mode === 'create' ? '' : undefined,
      surname: mode === 'create' ? '' : undefined,
      email: mode === 'create' ? '' : undefined,
      password: mode === 'create' ? '' : undefined,
      roleId: initialValues ? String(initialValues.roleId) : ''
    }
  })

  useEffect(() => {
    listRolesAction()
      .then(setRoles)
      .catch(() => toast.error('Não foi possível carregar os papéis.'))
  }, [])

  async function onSubmit(values: TeamFormValues) {
    try {
      if (mode === 'create') {
        if (!values.name || !values.surname || !values.email) {
          toast.error('Nome, sobrenome e e-mail são obrigatórios.')
          return
        }
        if (!values.password || values.password.length < 8) {
          toast.error('A senha é obrigatória e deve ter pelo menos 8 caracteres.')
          return
        }

        await createStaffAction({
          name: values.name,
          surname: values.surname,
          email: values.email,
          password: values.password,
          roleId: Number(values.roleId)
        })
        toast.success('Staff cadastrado com sucesso')
      } else {
        if (!staffId) return

        await reassignStaffRoleAction(staffId, Number(values.roleId))
        toast.success('Papel atualizado com sucesso')
      }

      router.push('/team')
    } catch {
      toast.error(mode === 'create' ? 'Não foi possível cadastrar o staff.' : 'Não foi possível atualizar o papel.')
    }
  }

  return (
    <Grid component='form' noValidate onSubmit={handleSubmit(onSubmit)} container spacing={3} sx={{ p: 3 }}>
      {mode === 'edit' && initialValues && (
        <Grid size={{ xs: 12 }}>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {initialValues.name} {initialValues.surname}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {initialValues.email}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Nome, sobrenome e e-mail só podem ser alterados pelo próprio staff, em Configurações da conta.
          </Typography>
        </Grid>
      )}

      {mode === 'create' && (
        <>
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='password'
              control={control}
              render={({ field }) => <TextField {...field} label='Senha' type='password' fullWidth />}
            />
          </Grid>
        </>
      )}

      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='roleId'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.roleId)}>
              <InputLabel id='team-form-role-label'>Papel</InputLabel>
              <Select {...field} labelId='team-form-role-label' label='Papel'>
                {roles.map(role => (
                  <MenuItem key={role.id} value={String(role.id)}>
                    {role.name}
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
        <Button intent='ghost' onClick={() => router.push('/team')}>
          Cancelar
        </Button>
      </Grid>
    </Grid>
  )
}
