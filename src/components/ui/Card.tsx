import type { ReactNode } from 'react'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { SxProps, Theme } from '@mui/material/styles'

export interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  sx?: SxProps<Theme>
  /**
   * Tag semântica do título — por padrão `CardHeader` não renderiza nenhum
   * heading real (`<h1>`-`<h6>`), só um `<span>` estilizado. Passe `'h1'`
   * quando este `Card` for o conteúdo principal da página (telas de
   * criar/editar, configurações) para a página ter um heading de nível 1 de
   * verdade — achado real de auditoria de acessibilidade. Deixe undefined em
   * cards que são só uma seção dentro de uma página que já tem seu próprio
   * `<h1>` em outro lugar (ex.: Dashboard).
   */
  titleComponent?: 'h1' | 'h2'
}

/** Composição consistente título/subtítulo/ações/conteúdo — a aparência (borda, sombra, radius) já vem do tema (`MuiCard` em `src/theme/theme.ts`). */
export function Card({ title, subtitle, actions, children, sx, titleComponent }: CardProps) {
  return (
    <MuiCard sx={sx}>
      {(title || actions) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={actions}
          slotProps={titleComponent ? { title: { component: titleComponent } } : undefined}
        />
      )}
      <CardContent>{children}</CardContent>
    </MuiCard>
  )
}
