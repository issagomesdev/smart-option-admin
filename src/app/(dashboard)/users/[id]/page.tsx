import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Card } from '@/components/ui/Card'
import { StatusBadge, booleanStatusToBadge } from '@/components/ui/StatusBadge'
import { BackendApiError } from '@/infrastructure/http/backend-client'
import { products } from '@/domain/products'
import { getBotUserAction } from '../users.actions'
import { UserRequestsTabs } from '../UserRequestsTabs'
import { ViewUserHeader } from '../ViewUserHeader'

export const metadata: Metadata = { title: 'Detalhes do usuário' }

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant='body2' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body1' component='div'>
        {value}
      </Typography>
    </Grid>
  )
}

export default async function ViewUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = Number(id)

  const user = await getBotUserAction(userId).catch((error: unknown) => {
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
  })

  if (!user) notFound()

  const statusBadge = booleanStatusToBadge(user.status === 1)
  const blockedBadge = booleanStatusToBadge(user.isActive)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <ViewUserHeader userId={userId} userName={user.name} />

      <Card title='Dados do usuário'>
        <Grid container spacing={3}>
          <Field label='ID' value={user.id} />
          <Field label='E-mail' value={user.email} />
          <Field label='Telefone' value={user.phoneNumber} />
          <Field label='Endereço' value={user.adress} />
          <Field label='Chave Pix' value={user.pixCode} />
          <Field label='Plano' value={user.plan === 'without' ? 'Nenhum' : (products[user.plan] ?? user.plan)} />
          <Field
            label='Telegram'
            value={
              user.telegram === 'off' ? (
                '—'
              ) : user.telegram === 'indisponível' ? (
                'Indisponível'
              ) : (
                <NextLink href={`https://web.telegram.org/k/#@${user.telegram}`} target='_blank'>
                  {user.telegram}
                </NextLink>
              )
            }
          />
          <Field label='Cadastrado em' value={user.created_at} />
          <Field label='Situação' value={<StatusBadge label={statusBadge.label} tone={statusBadge.tone} />} />
          <Field
            label='Bloqueio'
            value={<StatusBadge label={user.isActive ? 'Desbloqueado' : 'Bloqueado'} tone={blockedBadge.tone} />}
          />
        </Grid>
      </Card>

      <Card title='Solicitações deste usuário'>
        <UserRequestsTabs userId={userId} />
      </Card>
    </Box>
  )
}
