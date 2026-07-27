'use client'

import { cloneElement, type ReactElement } from 'react'
import Tooltip from '@mui/material/Tooltip'
import { useIsDemo } from '@/components/shell/SessionContext'

/** Mesma frase do backend (`config/demo.ts`) — a UI nunca deve explicar a recusa de um jeito diferente. */
export const DEMO_BLOCKED_MESSAGE = 'Esta ação está desabilitada na demonstração.'

export interface DemoGuardProps {
  /** Controle a ser envolvido. Recebe `disabled` quando a sessão é de demonstração. */
  children: ReactElement<{ disabled?: boolean }>
  /** Explicação específica da ação. Cai na mensagem padrão quando omitida. */
  reason?: string
}

/**
 * Desabilita um controle no modo demonstração e explica o motivo num tooltip.
 *
 * Escolhemos desabilitar em vez de esconder (o outro idiom do painel, usado para permissões): o
 * objetivo da demonstração é justamente mostrar o produto completo, então sumir com metade dos
 * botões contaria uma história pior sobre o sistema do que exibi-los indisponíveis.
 *
 * O `<span>` existe porque elemento desabilitado não emite eventos de mouse no DOM — sem um
 * wrapper habilitado, o `Tooltip` do MUI nunca apareceria e a explicação (a parte útil) se perderia.
 *
 * Fora do modo demonstração devolve o filho intacto, sem wrapper nem tooltip.
 */
export function DemoGuard({ children, reason }: DemoGuardProps) {
  const isDemo = useIsDemo()
  if (!isDemo) return children

  return (
    <Tooltip title={reason ?? DEMO_BLOCKED_MESSAGE}>
      {/*
        Reaproveita o próprio `disabled` do controle (todos os usados aqui — `Button`, `IconButton`,
        `Switch`, `Checkbox` — aceitam a prop), em vez de bloquear o clique por cima com
        `pointerEvents`, que deixaria o controle ainda acionável por teclado.
      */}
      <span style={{ display: 'inline-flex' }}>{cloneElement(children, { disabled: true })}</span>
    </Tooltip>
  )
}
