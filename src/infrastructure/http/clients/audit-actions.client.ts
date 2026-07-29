import { paginatedAuditActionsSchema, type AuditActionFiltersParams } from '@/domain/dtos/audit-actions.dto'
import { authorizedFetch } from '../session'

/** `POST` (não `GET`) pelo mesmo motivo da auditoria financeira: filtros demais para uma query string. */
export async function listAuditActions(filters: AuditActionFiltersParams = {}) {
  const data = await authorizedFetch('/api/audit/actions', { method: 'POST', body: filters })
  return paginatedAuditActionsSchema.parse(data)
}
