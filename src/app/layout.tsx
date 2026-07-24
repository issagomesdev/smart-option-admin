import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import '../../styles/globals.css'

const APP_NAME = 'Smart Option Admin'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_NAME,
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/apple-touch-icon.png'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='pt-BR'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- regra pensada para
        Pages Router (`_document`); no App Router, carregar a fonte no root layout é o
        padrão correto. Migrar para `next/font` fica para quando o tema (`ThemeOptions.ts`,
        que referencia a família 'Inter' pelo nome literal) for revisado na Fase 3/4. */}
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
