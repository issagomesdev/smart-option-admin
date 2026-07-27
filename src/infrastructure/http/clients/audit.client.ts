import { paginatedAuditSchema, type AuditFiltersParams } from '@/domain/dtos/audit.dto'
import { authorizedFetch } from '../session'

export async function listAuditMovements(filters: AuditFiltersParams = {}) {
  const data = await authorizedFetch('/api/audit', { method: 'POST', body: filters })
  return paginatedAuditSchema.parse(data)
}
