'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import { Button } from '@/components/ui/Button'
import { loginInputSchema, type LoginInput } from '@/domain/dtos/auth.dto'
import type { z } from 'zod'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // `remember` tem `.default(false)` no schema — o tipo de "entrada" do zod
  // o deixa opcional (`z.input<>`), mas o resolver sempre entrega o valor já
  // com o default aplicado no `onSubmit` (`z.output<>` = `LoginInput`, o
  // terceiro parâmetro de `useForm`). Ver `@hookform/resolvers` docs.
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<z.input<typeof loginInputSchema>, unknown, LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '', remember: false }
  })

  async function onSubmit(values: LoginInput) {
    setFormError(null)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })

    const body = await response.json()

    if (!body.success) {
      setFormError(body.error?.message ?? 'Não foi possível entrar. Tente novamente.')
      return
    }

    const destination = searchParams?.get('from') || '/'
    router.replace(destination)
    router.refresh()
  }

  return (
    <Box
      component='form'
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Controller
        name='email'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='E-mail'
            type='email'
            autoComplete='email'
            autoFocus
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
        )}
      />

      <Controller
        name='password'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='Senha'
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'
            fullWidth
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword(value => !value)}
                      edge='end'
                    >
                      {showPassword ? <EyeOffOutline fontSize='small' /> : <EyeOutline fontSize='small' />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        )}
      />

      <Controller
        name='remember'
        control={control}
        render={({ field }) => (
          <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label='Manter conectado' />
        )}
      />

      {formError && (
        <Typography role='alert' variant='body2' color='error.main'>
          {formError}
        </Typography>
      )}

      <Button type='submit' intent='primary' size='large' loading={isSubmitting} fullWidth>
        Entrar
      </Button>
    </Box>
  )
}
