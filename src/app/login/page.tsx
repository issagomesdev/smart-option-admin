import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Card } from '@/components/ui/Card'
import { getCurrentUser, isDemoBackend } from '@/infrastructure/http/session'
import { LoginForm } from './LoginForm'

const APP_NAME = 'Smart Option Admin'

export const metadata: Metadata = {
  title: `Entrar — ${APP_NAME}`
}

export default async function LoginPage() {
  // Já autenticado (cookie válido) — não faz sentido mostrar o formulário de novo.
  const user = await getCurrentUser()
  if (user) {
    redirect('/')
  }

  // Quem decide é o backend (`APP_DEMO`), não uma env var própria do painel — evita as duas
  // fontes divergirem e o botão aparecer apontando para uma rota que responde 404.
  const demoEnabled = await isDemoBackend()

  return (
    <Box
      component='main'
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='h2' component='h1' gutterBottom>
            {APP_NAME}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Entre com sua conta para acessar o painel.
          </Typography>
        </Box>
        <Card>
          <LoginForm demoEnabled={demoEnabled} />
        </Card>
      </Box>
    </Box>
  )
}
