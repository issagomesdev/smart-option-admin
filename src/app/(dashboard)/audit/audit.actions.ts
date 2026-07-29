'use server'

import { listAuditMovements } from '@/infrastructure/http/clients/audit.client'
import { listAuditActions } from '@/infrastructure/http/clients/audit-actions.client'
import type { AuditFiltersParams } from '@/domain/dtos/audit.dto'
import type { AuditActionFiltersParams } from '@/domain/dtos/audit-actions.dto'

export async function listAuditMovementsAction(filters: AuditFiltersParams) {
  return listAuditMovements(filters)
}

export async function listAuditActionsAction(filters: AuditActionFiltersParams) {
  return listAuditActions(filters)
}
