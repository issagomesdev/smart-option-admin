'use client'

import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import { Button } from '@/components/ui/Button'

export interface ViewUserHeaderProps {
  userId: number
  userName: string
}

/**
 * `component={NextLink}` só pode ser passado ao `Button` (Client Component)
 * dentro de uma árvore que já é client — passar a referência de componente
 * como prop crua a partir do Server Component `ViewUserPage` quebra a
 * serialização RSC ("Functions cannot be passed directly to Client
 * Components"). Por isso este cabeçalho vira seu próprio Client Component.
 */
export function ViewUserHeader({ userId, userName }: ViewUserHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      <Typography variant='h1'>{userName}</Typography>
      <Button
        intent='secondary'
        component={NextLink}
        href={`/users/${userId}/edit`}
        startIcon={<PencilOutline fontSize='small' />}
      >
        Editar
      </Button>
    </Box>
  )
}
