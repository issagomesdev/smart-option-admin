import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import type { DataTableColumn } from './DataTable'

/**
 * Texto plano de uma célula pra exportação (CSV/PDF) — nunca o `ReactNode`
 * de `render` direto (chips, links, switches, botões não têm uma
 * representação textual óbvia). Prioridade: `exportValue` explícito >
 * `render` quando ele já devolve uma string/number pura (a maioria das
 * colunas — formatação de moeda/data/rótulo) > valor bruto do campo.
 */
function getExportText<T>(column: DataTableColumn<T>, row: T): string {
  if (column.exportValue) return column.exportValue(row)

  if (column.render) {
    const rendered = column.render(row)
    if (typeof rendered === 'string' || typeof rendered === 'number') return String(rendered)
    return ''
  }

  const raw = (row as Record<string, unknown>)[column.key]
  return raw == null ? '' : String(raw)
}

function exportableColumns<T>(columns: DataTableColumn<T>[]): DataTableColumn<T>[] {
  return columns.filter(column => !column.excludeFromExport)
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** BOM (`﻿`) no início: sem ele, Excel abre acentos/caracteres PT-BR como lixo (assume Latin-1 em vez de UTF-8). */
export function exportRowsToCsv<T>(columns: DataTableColumn<T>[], rows: T[], filename: string): void {
  const cols = exportableColumns(columns)
  const lines = [
    cols.map(column => csvEscape(column.label)).join(','),
    ...rows.map(row => cols.map(column => csvEscape(getExportText(column, row))).join(','))
  ]
  const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

export function exportRowsToPdf<T>(columns: DataTableColumn<T>[], rows: T[], filename: string, title: string): void {
  const cols = exportableColumns(columns)
  const doc = new jsPDF({ orientation: cols.length > 6 ? 'landscape' : 'portrait' })

  doc.setFontSize(14)
  doc.text(title, 14, 15)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Exportado em ${new Date().toLocaleString('pt-BR')} — ${rows.length} registro(s)`, 14, 21)

  autoTable(doc, {
    startY: 26,
    head: [cols.map(column => column.label)],
    body: rows.map(row => cols.map(column => getExportText(column, row))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229] } // indigo-600 (theme.ts colorTokens.indigo[600])
  })

  doc.save(filename)
}

/**
 * Busca todas as páginas que batem o filtro atual — as telas do painel
 * pedem só uma página por vez ao backend (Fase 0, paginação server-side),
 * mas "exportar" precisa do resultado inteiro, não só o que está na tela.
 * `limit` no teto que o backend aceita (100 — `admin.dto.ts`/`staff.dto.ts`,
 * `z.coerce.number().max(100)`; um valor maior aqui derruba a requisição
 * com `VALIDATION_ERROR`, achado real ao verificar a exportação ao vivo).
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<{ data: T[]; pagination: PaginationMeta }>,
  limit = 100
): Promise<T[]> {
  const all: T[] = []
  let page = 1

  while (true) {
    const result = await fetchPage(page, limit)
    all.push(...result.data)
    if (page >= result.pagination.totalPages || result.data.length === 0) break
    page += 1
  }

  return all
}
