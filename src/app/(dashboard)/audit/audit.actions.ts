'use server'

import { listAuditMovements } from '@/infrastructure/http/clients/audit.client'
import type { AuditFiltersParams } from '@/domain/dtos/audit.dto'

export async function listAuditMovementsAction(filters: AuditFiltersParams) {
  return listAuditMovements(filters)
}
