/**
 * Espelha `shared/permissions/permissions.ts` do backend (`smart-option/`) —
 * fonte da verdade é lá; aqui é só o vocabulário usado para gating client-side
 * (esconder/desabilitar ação). A garantia real de autorização é sempre o
 * backend (`requirePermission`), nunca esta checagem.
 */
export const PERMISSIONS = [
  'users.write',
  'finance.adjust',
  'withdrawals.approve',
  'support.write',
  'staff.manage',
  'roles.manage',
  'plans.manage'
] as const

export type Permission = (typeof PERMISSIONS)[number]

/** Rótulos em PT-BR para as telas de Papéis (Fase 5 parte 8) — só apresentação, não afeta a checagem em si. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  'users.write': 'Gerenciar usuários (criar, editar, excluir, bloquear)',
  'finance.adjust': 'Ajustar saldo manualmente',
  'withdrawals.approve': 'Aprovar ou rejeitar saques',
  'support.write': 'Marcar solicitações de suporte como concluídas',
  'staff.manage': 'Gerenciar equipe (criar, listar, editar papel, desativar staff)',
  'roles.manage': 'Gerenciar papéis (criar, editar, excluir)',
  'plans.manage': 'Gerenciar planos (criar, editar, ativar/desativar, excluir)'
}
