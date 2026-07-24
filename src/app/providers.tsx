'use client'

import type { ReactNode } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '@/theme/theme'
import { ToastContainer } from '@/components/ui/toast'

/** Provider raiz único do App Router (tema, reset de CSS, toasts) — `src/pages/**`/`src/@core/**` foram removidos na Fase 4 parte 4, quando a última tela saiu do Pages Router. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <ToastContainer />
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
