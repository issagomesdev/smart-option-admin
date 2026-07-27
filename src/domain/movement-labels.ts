import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import CashPlus from 'mdi-material-ui/CashPlus'
import CashMinus from 'mdi-material-ui/CashMinus'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import ArrowDownBold from 'mdi-material-ui/ArrowDownBold'
import ArrowUpBold from 'mdi-material-ui/ArrowUpBold'
import TuneVariant from 'mdi-material-ui/TuneVariant'
import DiamondStone from 'mdi-material-ui/DiamondStone'
import CardAccountDetails from 'mdi-material-ui/CardAccountDetails'
import { colorTokens } from '@/theme/tokens'
import type { StatusTone } from '@/components/ui/StatusBadge'

export interface MovementDisplay {
  label: string
  icon: ComponentType<SvgIconProps>
  color: string
}

/**
 * Rótulo/ícone/cor por `kind` (origem do `wallet_transactions.origin`, reaproveitado pelo `type` de
 * `checkouts` e pelo literal fixo `'withdrawal'`) — compartilhado entre a tabela de "Movimentações
 * recentes" do Dashboard e a Auditoria Financeira, pra não duplicar o mapeamento nos dois lugares.
 * Alguns `kind` (subscription, tuition, admin_adjustment) significam coisas diferentes dependendo de
 * `direction` — uma compra vs. a comissão que ela gera para o afiliado acima, por exemplo.
 */
export function describeMovement(kind: string, direction: 'credit' | 'debit'): MovementDisplay {
  const isCredit = direction === 'credit'
  const moneyIn = colorTokens.emerald[600]
  const neutral = colorTokens.slate[600]

  switch (kind) {
    case 'deposit':
      return { label: 'Depósito PIX', icon: CashPlus, color: moneyIn }
    case 'withdrawal':
      return { label: 'Saque', icon: CashMinus, color: neutral }
    case 'earnings':
      return { label: 'Rendimento', icon: TrendingUp, color: moneyIn }
    case 'profitability':
      return { label: 'Comissão de Rede', icon: AccountGroup, color: moneyIn }
    case 'subscription':
      return isCredit
        ? { label: 'Comissão de Adesão', icon: AccountGroup, color: moneyIn }
        : { label: 'Plano Adquirido', icon: CardAccountDetails, color: neutral }
    case 'tuition':
      return isCredit
        ? { label: 'Comissão de Mensalidade', icon: AccountGroup, color: moneyIn }
        : { label: 'Renovação de Plano', icon: CardAccountDetails, color: neutral }
    case 'transfer_in':
      return { label: 'Transferência Recebida', icon: ArrowDownBold, color: moneyIn }
    case 'transfer_out':
      return { label: 'Transferência Enviada', icon: ArrowUpBold, color: neutral }
    case 'admin_adjustment':
      return isCredit
        ? { label: 'Ajuste Administrativo (Crédito)', icon: TuneVariant, color: moneyIn }
        : { label: 'Ajuste Administrativo (Débito)', icon: TuneVariant, color: neutral }
    case 'diamond_tax':
      return { label: 'Taxa Diamond', icon: DiamondStone, color: neutral }
    default:
      return { label: kind, icon: CashPlus, color: neutral }
  }
}

const STATUS_LABELS: Record<string, { label: string; tone: StatusTone }> = {
  concluido: { label: 'Concluído', tone: 'success' },
  pending: { label: 'Pendente', tone: 'warning' },
  PENDING: { label: 'Pendente', tone: 'warning' },
  authorized: { label: 'Autorizado', tone: 'info' },
  AUTHORIZED: { label: 'Autorizado', tone: 'info' },
  IN_ANALYSIS: { label: 'Em análise', tone: 'info' }
}

/** Status bruto e heterogêneo entre as 3 fontes (`concluido`/`pending`/`PENDING`/...) → rótulo + tom do `StatusBadge`. */
export function describeMovementStatus(status: string): { label: string; tone: StatusTone } {
  return STATUS_LABELS[status] ?? { label: status, tone: 'neutral' }
}
