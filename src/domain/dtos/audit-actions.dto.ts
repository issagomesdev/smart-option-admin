import { z } from 'zod'
import { paginatedSchema, type PaginationParams } from './common.dto'

/** Espelha `AUDIT_ACTIONS` do backend (`shared/audit/audit-log.ts`), a fonte da verdade. */
export const AUDIT_ACTION_VALUES = [
  'staff.created',
  'staff.updated',
  'staff.role_changed',
  'staff.deactivated',
  'staff.deleted',
  'role.created',
  'role.updated',
  'role.deleted',
  'bot_user.created',
  'bot_user.updated',
  'bot_user.deleted',
  'bot_user.blocked',
  'bot_user.unblocked',
  'wallet.admin_credit',
  'wallet.admin_debit',
  'withdrawal.approved',
  'withdrawal.refused',
  'support.marked_read'
] as const

export type AuditActionValue = (typeof AUDIT_ACTION_VALUES)[number]

export const AUDIT_ACTION_LABELS: Record<AuditActionValue, string> = {
  'staff.created': 'Colaborador cadastrado',
  'staff.updated': 'Colaborador editado',
  'staff.role_changed': 'Papel reatribuído',
  'staff.deactivated': 'Colaborador desativado',
  'staff.deleted': 'Colaborador excluído',
  'role.created': 'Papel criado',
  'role.updated': 'Papel editado',
  'role.deleted': 'Papel excluído',
  'bot_user.created': 'Usuário cadastrado',
  'bot_user.updated': 'Usuário editado',
  'bot_user.deleted': 'Usuário excluído',
  'bot_user.blocked': 'Usuário bloqueado',
  'bot_user.unblocked': 'Usuário desbloqueado',
  'wallet.admin_credit': 'Saldo creditado',
  'wallet.admin_debit': 'Saldo debitado',
  'withdrawal.approved': 'Saque aprovado',
  'withdrawal.refused': 'Saque recusado',
  'support.marked_read': 'Suporte concluído'
}

/** Agrupamento usado no filtro — reflete as áreas do painel, não a tabela de origem. */
export const AUDIT_ACTION_GROUPS: Record<string, string> = {
  staff_users: 'Equipe',
  roles: 'Papéis',
  bot_users: 'Usuários e saldo',
  withdrawals: 'Saques',
  requests: 'Suporte'
}

export const auditActionItemSchema = z.object({
  id: z.number().int().positive(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  actorId: z.number().nullable(),
  actorName: z.string().nullable(),
  /** Preservado no JSON da trilha mesmo quando a conta do ator é removida. */
  actorEmail: z.string().nullable(),
  before: z.unknown().nullable(),
  after: z.unknown().nullable(),
  createdAt: z.string()
})

export type AuditActionItem = z.infer<typeof auditActionItemSchema>
export const paginatedAuditActionsSchema = paginatedSchema(auditActionItemSchema)
export type PaginatedAuditActions = z.infer<typeof paginatedAuditActionsSchema>

export interface AuditActionFiltersParams extends PaginationParams {
  period?: 'today' | '7d' | '30d' | 'custom'
  start?: string
  end?: string
  action?: AuditActionValue
  entityType?: string
  actorId?: number
  search?: string
}
