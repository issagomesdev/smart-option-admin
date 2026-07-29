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
import { DemoGuard } from '@/components/ui/DemoGuard'
import { toast } from '@/components/ui/toast'
import type { Role } from '@/domain/dtos/roles.dto'
import type { StaffDetail } from '@/domain/dtos/staff.dto'
import { createStaffAction, listRolesAction, reassignStaffRoleAction, updateStaffAction } from './team.actions'

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
 * Um só componente para os dois modos, mesmo padrão de `UserForm` — os campos são opcionais no
 * schema e validados à mão no `onSubmit`, em vez de um segundo schema.
 *
 * Nos dois modos, nome/sobrenome/e-mail são editáveis por quem tem `staff.manage`. A senha é
 * obrigatória ao criar e opcional ao editar: em branco, mantém a atual. O próprio staff continua
 * podendo alterar os mesmos dados em Configurações da conta — lá a troca de senha exige a senha
 * atual, aqui não, porque quem gerencia a equipe não a conhece.
 *
 * Qualquer portador de `staff.manage` pode editar qualquer colaborador, inclusive um com mais
 * permissões. A contenção dessa decisão é a trilha de auditoria: toda edição fica registrada com
 * autor, horário e o antes/depois, visível em Auditoria > Ações administrativas.
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
    // A senha fica `''` nos dois modos: é `.optional()` no schema, mas uma string vazia ainda seria
    // validada contra o `.min(1)` interno se o campo tivesse um — como não tem, `''` é seguro e
    // permite distinguir "não quis trocar" de uma senha de verdade no `onSubmit`.
    defaultValues: {
      name: initialValues?.name ?? '',
      surname: initialValues?.surname ?? '',
      email: initialValues?.email ?? '',
      password: '',
      roleId: initialValues ? String(initialValues.roleId) : ''
    }
  })

  useEffect(() => {
    listRolesAction()
      .then(setRoles)
      .catch(() => toast.error('Não foi possível carregar os papéis.'))
  }, [])

  async function onSubmit(values: TeamFormValues) {
    if (!values.name || !values.surname || !values.email) {
      toast.error('Nome, sobrenome e e-mail são obrigatórios.')
      return
    }

    try {
      if (mode === 'create') {
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
        toast.success('Colaborador cadastrado com sucesso')
      } else {
        if (!staffId) return

        // Na edição a senha é opcional: em branco, mantém a atual. Só é enviada quando preenchida,
        // e aí precisa respeitar o mesmo mínimo do cadastro.
        if (values.password && values.password.length < 8) {
          toast.error('A nova senha deve ter pelo menos 8 caracteres.')
          return
        }

        // Dois endpoints porque são duas operações distintas no backend: os dados do colaborador
        // (`PATCH /api/staff/:id`) e o papel (`PATCH /api/staff/:id/role`, que tem as próprias
        // travas contra auto-escalação e contra deixar o sistema sem ninguém com `staff.manage`).
        await updateStaffAction(staffId, {
          name: values.name,
          surname: values.surname,
          email: values.email,
          ...(values.password ? { password: values.password } : {})
        })

        if (initialValues && Number(values.roleId) !== initialValues.roleId) {
          await reassignStaffRoleAction(staffId, Number(values.roleId))
        }

        toast.success('Colaborador atualizado com sucesso')
      }

      router.push('/team')
      router.refresh()
    } catch {
      toast.error(
        mode === 'create' ? 'Não foi possível cadastrar o colaborador.' : 'Não foi possível atualizar o colaborador.'
      )
    }
  }

  return (
    <Grid component='form' noValidate onSubmit={handleSubmit(onSubmit)} container spacing={3} sx={{ p: 3 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <TextField {...field} label='Nome' fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
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
          render={({ field }) => (
            <TextField
              {...field}
              label={mode === 'create' ? 'Senha' : 'Nova senha'}
              type='password'
              autoComplete='new-password'
              fullWidth
              helperText={
                mode === 'create'
                  ? 'Mínimo de 8 caracteres.'
                  : 'Deixe em branco para manter a senha atual. A senha atual não é necessária.'
              }
            />
          )}
        />
      </Grid>

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
        <DemoGuard reason='Gerenciar a equipe está desabilitado na demonstração — evita trancar o acesso dos próximos visitantes.'>
          <Button type='submit' intent='primary' loading={isSubmitting}>
            {mode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
          </Button>
        </DemoGuard>
        <Button intent='ghost' onClick={() => router.push('/team')}>
          Cancelar
        </Button>
      </Grid>
    </Grid>
  )
}
