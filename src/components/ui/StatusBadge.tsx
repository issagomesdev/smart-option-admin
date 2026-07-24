import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'
import type { CheckoutStatus } from '@/domain/dtos/requests.dto'
import type { WithdrawalStatus } from '@/domain/dtos/requests.dto'
import { colorTokens } from '@/theme/tokens'

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

// Todos em `[700]`, não `[500]`/`[600]` como a escala sugeriria à primeira
// vista — achado real de auditoria de acessibilidade (medido pelo Chrome via
// axe-core, não só cálculo manual): contra o fundo do chip
// (`alpha(color, 0.12)` sobre branco), `[600]` mede só ~3,25:1–3,51:1 para
// `emerald`/`sky` (abaixo do mínimo AA de 4,5:1 para texto normal), mesmo
// `[600]` sendo suficiente para `slate` (cores dessaturadas e saturadas têm
// curvas de luminância bem diferentes no mesmo número de escala).
const TONE_COLORS: Record<StatusTone, string> = {
  success: colorTokens.emerald[700],
  warning: colorTokens.amber[700],
  error: colorTokens.red[700],
  info: colorTokens.sky[700],
  neutral: colorTokens.slate[700]
}

export interface StatusBadgeProps {
  label: string
  tone: StatusTone
}

/**
 * Badge de status genérico, por "tone" semântico — não conhece nenhum
 * vocabulário de status específico (checkout, saque, etc.). Os mapeamentos
 * `checkoutStatusToBadge`/`withdrawalStatusToBadge` abaixo traduzem os dois
 * vocabulários reais do backend (achado da auditoria: `checkouts.status` e
 * `withdrawals.status` usam palavras diferentes para conceitos parecidos,
 * de propósito — não são um bug para "unificar").
 */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const color = TONE_COLORS[tone]

  return (
    <Chip
      label={label}
      size='small'
      sx={{
        color,
        backgroundColor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.24)}`
      }}
    />
  )
}

const CHECKOUT_STATUS_MAP: Record<CheckoutStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pendente', tone: 'warning' },
  AUTHORIZED: { label: 'Autorizado', tone: 'info' },
  PAID: { label: 'Pago', tone: 'success' },
  IN_ANALYSIS: { label: 'Em análise', tone: 'info' },
  DECLINED: { label: 'Recusado', tone: 'error' },
  CANCELED: { label: 'Cancelado', tone: 'neutral' }
}

export function checkoutStatusToBadge(status: CheckoutStatus): { label: string; tone: StatusTone } {
  return CHECKOUT_STATUS_MAP[status]
}

const WITHDRAWAL_STATUS_MAP: Record<WithdrawalStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pendente', tone: 'warning' },
  authorized: { label: 'Autorizado', tone: 'info' },
  success: { label: 'Concluído', tone: 'success' },
  refused: { label: 'Recusado', tone: 'error' },
  failed: { label: 'Falhou', tone: 'error' }
}

export function withdrawalStatusToBadge(status: WithdrawalStatus): { label: string; tone: StatusTone } {
  return WITHDRAWAL_STATUS_MAP[status]
}

export function booleanStatusToBadge(isActive: boolean): { label: string; tone: StatusTone } {
  return isActive ? { label: 'Ativo', tone: 'success' } : { label: 'Inativo', tone: 'neutral' }
}
