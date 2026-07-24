import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

/** Substitui as 6 mensagens de "lista vazia" duplicadas (uma por tela, textos/estilos diferentes) encontradas na auditoria. */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.5,
        py: 8,
        px: 3
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.disabled', fontSize: 48, display: 'flex' }} aria-hidden>
          {icon}
        </Box>
      )}
      {/* `component='p'`: mensagem de estado, não um heading de verdade — toda
          página que usa `EmptyState` já tem seu próprio `<h1>` em outro
          lugar; sem isso, `variant='h4'` sozinho vira um `<h4>` solto no
          meio da página, pulando níveis do heading outline (achado real de
          auditoria). */}
      <Typography variant='h4' component='p'>
        {title}
      </Typography>
      {description && (
        <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  )
}
