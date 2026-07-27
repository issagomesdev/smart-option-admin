'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { DemoGuard } from '@/components/ui/DemoGuard'
import { toast } from '@/components/ui/toast'
import { useSession } from '@/components/shell/SessionContext'
import { PERMISSIONS, PERMISSION_LABELS } from '@/domain/permissions'
import type { Role } from '@/domain/dtos/roles.dto'
import { createRoleAction, updateRoleAction } from './roles.actions'

const roleFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório').max(100),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string())
})

type RoleFormValues = z.infer<typeof roleFormSchema>

export interface RoleFormProps {
  mode: 'create' | 'edit'
  roleId?: number
  initialValues?: Role
}

/**
 * Checkboxes desabilitados para permissões que o próprio staff logado não
 * possui — reflexo client-side de `assertCanGrant` (backend, Fase 5 parte
 * 3): um staff só pode conceder o que já tem. O backend continua sendo a
 * garantia real; isto só evita convidar um clique que sempre falharia com
 * 403.
 */
export function RoleForm({ mode, roleId, initialValues }: RoleFormProps) {
  const router = useRouter()
  const { permissions: actorPermissions } = useSession()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      permissions: initialValues?.permissions ?? []
    }
  })

  async function onSubmit(values: RoleFormValues) {
    const payload = { name: values.name, description: values.description || undefined, permissions: values.permissions }

    try {
      if (mode === 'create') {
        await createRoleAction(payload)
        toast.success('Papel cadastrado com sucesso')
      } else {
        if (!roleId) return
        await updateRoleAction(roleId, payload)
        toast.success('Papel atualizado com sucesso')
      }

      router.push('/team/roles')
    } catch {
      toast.error(mode === 'create' ? 'Não foi possível cadastrar o papel.' : 'Não foi possível atualizar o papel.')
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
          name='description'
          control={control}
          render={({ field }) => <TextField {...field} label='Descrição (opcional)' fullWidth />}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        {/* `component='p'`: rótulo de seção do formulário, não um heading de
            verdade — `subtitle2` mapeia para `<h6>` por padrão, o que pulava
            do `<h1>` do título da página direto pra `<h6>` (achado real de
            auditoria, só ficou visível depois que a página passou a ter um
            `<h1>` de verdade). */}
        <Typography variant='subtitle2' component='p' sx={{ mb: 1 }}>
          Permissões
        </Typography>
        <Controller
          name='permissions'
          control={control}
          render={({ field }) => (
            <FormGroup>
              {PERMISSIONS.map(permission => {
                const canGrant = actorPermissions.includes(permission)
                const checked = field.value.includes(permission)

                return (
                  <Tooltip
                    key={permission}
                    title={canGrant ? '' : 'Você não pode conceder uma permissão que não possui'}
                  >
                    <span>
                      <FormControlLabel
                        disabled={!canGrant}
                        control={
                          <Checkbox
                            checked={checked}
                            disabled={!canGrant}
                            onChange={event => {
                              const next = event.target.checked
                                ? [...field.value, permission]
                                : field.value.filter(value => value !== permission)
                              field.onChange(next)
                            }}
                          />
                        }
                        label={PERMISSION_LABELS[permission]}
                      />
                    </span>
                  </Tooltip>
                )
              })}
            </FormGroup>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
        <DemoGuard reason='Editar papéis está desabilitado na demonstração — alterar permissões poderia inutilizar o painel.'>
          <Button type='submit' intent='primary' loading={isSubmitting}>
            {mode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
          </Button>
        </DemoGuard>
        <Button intent='ghost' onClick={() => router.push('/team/roles')}>
          Cancelar
        </Button>
      </Grid>
    </Grid>
  )
}
