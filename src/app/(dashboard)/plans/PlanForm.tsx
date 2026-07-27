'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/toast'
import { PLAN_PURCHASE_TYPES, PLAN_PURCHASE_TYPE_LABELS, type Plan } from '@/domain/dtos/plans.dto'
import { createPlanAction, updatePlanAction } from './plans.actions'

/**
 * Preço e rentabilidade chegam do `<input>` como string; `z.coerce.number()` converte antes de
 * validar, e o `''` inicial vira `NaN` — daí a mensagem explícita em vez do "Expected number" do zod.
 */
const planFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório').max(255),
  description: z.string().min(1, 'Campo obrigatório'),
  price: z.coerce.number({ error: 'Informe um valor válido' }).nonnegative('Valor não pode ser negativo'),
  earningsMonthly: z.coerce
    .number({ error: 'Informe um percentual válido' })
    .nonnegative('Rentabilidade não pode ser negativa')
    .max(999.99, 'Máximo 999,99%'),
  purchaseType: z.enum(PLAN_PURCHASE_TYPES),
  isActive: z.boolean()
})

type PlanFormValues = z.input<typeof planFormSchema>
type PlanFormOutput = z.output<typeof planFormSchema>

export interface PlanFormProps {
  mode: 'create' | 'edit'
  planId?: number
  initialValues?: Plan
}

export function PlanForm({ mode, planId, initialValues }: PlanFormProps) {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PlanFormValues, unknown, PlanFormOutput>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      price: initialValues?.price ?? 0,
      earningsMonthly: initialValues?.earningsMonthly ?? 0,
      purchaseType: initialValues?.purchaseType ?? 'auto',
      isActive: initialValues?.isActive ?? true
    }
  })

  const purchaseType = watch('purchaseType')
  const hasSubscribers = (initialValues?.subscriberCount ?? 0) > 0

  async function onSubmit(values: PlanFormOutput) {
    try {
      if (mode === 'create') {
        await createPlanAction(values)
        toast.success('Plano cadastrado com sucesso')
      } else {
        if (!planId) return
        await updatePlanAction(planId, values)
        toast.success('Plano atualizado com sucesso')
      }
      router.push('/plans')
      router.refresh()
    } catch {
      toast.error(mode === 'create' ? 'Não foi possível cadastrar o plano.' : 'Não foi possível atualizar o plano.')
    }
  }

  return (
    <Grid component='form' noValidate onSubmit={handleSubmit(onSubmit)} container spacing={3} sx={{ p: 3 }}>
      {mode === 'edit' && initialValues?.isSystem && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info'>
            Este é um plano do sistema. Ele pode ser editado, mas não excluído — a rotina de promoção automática de tier
            referencia os planos padrão pelo identificador.
          </Alert>
        </Grid>
      )}

      {mode === 'edit' && hasSubscribers && (
        <Grid size={{ xs: 12 }}>
          {/* Aviso de impacto real: `applyEarningsDaily` (backend) calcula o rendimento diário a
              partir de `earningsMonthly`, então editar aqui muda quanto os assinantes recebem. */}
          <Alert severity='warning'>
            {initialValues?.subscriberCount} usuário(s) já possuem este plano. Alterar a rentabilidade mensal muda o
            rendimento diário creditado a todos eles a partir do próximo processamento.
          </Alert>
        </Grid>
      )}

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
          name='purchaseType'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.purchaseType)}>
              <InputLabel id='plan-form-type-label'>Tipo</InputLabel>
              <Select {...field} labelId='plan-form-type-label' label='Tipo'>
                {PLAN_PURCHASE_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {PLAN_PURCHASE_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
          {purchaseType === 'auto'
            ? 'Compra imediata: gera cobrança PIX e libera o plano na confirmação.'
            : 'Sem cobrança automática: abre uma solicitação de atendimento para a equipe tratar.'}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='price'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Valor'
              type='number'
              fullWidth
              error={Boolean(errors.price)}
              helperText={
                errors.price?.message ??
                (purchaseType === 'manual'
                  ? 'Planos manuais podem ficar com 0,00 — o valor é combinado no atendimento.'
                  : undefined)
              }
              slotProps={{ input: { startAdornment: <InputAdornment position='start'>R$</InputAdornment> } }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name='earningsMonthly'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Rentabilidade mensal'
              type='number'
              fullWidth
              error={Boolean(errors.earningsMonthly)}
              helperText={errors.earningsMonthly?.message ?? 'Percentual ao mês usado no cálculo do rendimento diário.'}
              slotProps={{ input: { endAdornment: <InputAdornment position='end'>%</InputAdornment> } }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Descrição'
              fullWidth
              multiline
              rows={8}
              error={Boolean(errors.description)}
              helperText={errors.description?.message ?? 'Texto exibido ao usuário no bot, incluindo bonificações.'}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name='isActive'
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={event => field.onChange(event.target.checked)} />}
              label='Plano ativo (disponível para contratação)'
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
        <Button type='submit' intent='primary' loading={isSubmitting}>
          {mode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
        </Button>
        <Button intent='ghost' onClick={() => router.push('/plans')}>
          Cancelar
        </Button>
      </Grid>
    </Grid>
  )
}
