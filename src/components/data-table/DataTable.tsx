import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { PaginationMeta } from '@/domain/dtos/common.dto'
import { EmptyState } from '../ui/EmptyState'
import { LoadingScreen } from '../ui/LoadingScreen'
import { ExportMenu } from './ExportMenu'

export interface DataTableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string | number
  render?: (row: T) => ReactNode
  /**
   * Texto puro pra exportação (CSV/PDF) — só necessário quando `render`
   * devolve algo que não é texto simples (chip, link, switch, botão). Sem
   * isso, a exportação cai no valor bruto do campo (mesmo fallback do
   * `render` na tabela).
   */
  exportValue?: (row: T) => string
  /** Colunas de ação (botões "Responder"/"Visualizar" etc., sem dado de verdade) não fazem sentido num CSV/PDF — exclui da exportação sem esconder da tabela. */
  excludeFromExport?: boolean
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  rowsPerPageOptions?: number[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (column: string) => void
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  /** Área acima da tabela para filtros específicos da tela — o Design System não assume quais filtros cada domínio precisa. */
  toolbar?: ReactNode
  rowActions?: (row: T) => ReactNode
  /** Rótulo do `aria-label` da região com scroll horizontal — nome da tela ("Usuários", "Solicitações" etc.). */
  ariaLabel: string
  /**
   * Busca TODOS os registros que batem o filtro atual (não só a página
   * carregada) — quando presente, mostra o botão "Exportar" (CSV/PDF). Cada
   * tela implementa isso com o próprio `fetchAllPages` + a ação de listagem
   * já existente, reaproveitando os filtros correntes.
   */
  onExportAll?: () => Promise<T[]>
  /** Nome base do arquivo exportado (sem extensão) — default deriva de `ariaLabel`. */
  exportFilenameBase?: string
}

/**
 * Substitui a implementação de tabela ordenável/paginada/filtrável
 * (`descendingComparator`/`getComparator`/`stableSort`/`EnhancedTableHead`/
 * `EnhancedTableToolbar`) copiada verbatim em 7 arquivos diferentes,
 * encontrada na auditoria — toda client-side, sem usar `DataGrid`. Esta
 * versão é server-side de propósito: paginação/ordenação disparam callbacks
 * que a tela usa para pedir a próxima página ao backend (Fase 0), em vez de
 * buscar tudo e fatiar no navegador.
 *
 * Abaixo do breakpoint `sm`, troca a tabela por uma lista de cards (um por
 * linha, pares rótulo/valor empilhados) — achado real de auditoria de UX: a
 * tabela HTML não reflui em celular, só estoura a largura da tela. Tablet e
 * desktop continuam com a tabela normal (scroll horizontal contido quando
 * necessário, já com suporte a teclado).
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  pagination,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [10, 20, 50, 100],
  sortBy,
  sortDirection = 'asc',
  onSortChange,
  loading = false,
  emptyTitle = 'Nada encontrado',
  emptyDescription,
  toolbar,
  rowActions,
  ariaLabel,
  onExportAll,
  exportFilenameBase
}: DataTableProps<T>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const hasRowActions = Boolean(rowActions)

  const toolbarRow = (toolbar || onExportAll) && (
    <Box
      sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{toolbar}</Box>
      {onExportAll && (
        <ExportMenu
          columns={columns}
          onExportAll={onExportAll}
          filenameBase={exportFilenameBase ?? slugify(ariaLabel)}
          title={ariaLabel}
        />
      )}
    </Box>
  )

  const paginationControl = (
    <TablePagination
      component='div'
      count={pagination.total}
      page={pagination.page - 1}
      rowsPerPage={pagination.limit}
      rowsPerPageOptions={rowsPerPageOptions}
      onPageChange={(_event, newPage) => onPageChange(newPage + 1)}
      onRowsPerPageChange={event => onLimitChange?.(Number(event.target.value))}
      labelRowsPerPage='Linhas por página'
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
    />
  )

  if (isMobile) {
    return (
      <Paper variant='outlined' sx={{ width: '100%', overflow: 'hidden' }}>
        {toolbarRow}

        {loading ? (
          <LoadingScreen fullPage={false} />
        ) : rows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          // Sem `divider` no `Stack`: MUI `Divider` renderiza `<hr>`, que não é
          // filho direto válido de `<ul>` (achado real de auditoria — `<hr>`
          // entre os `<li>` quebrava a mesma regra que a Fase de UX corrigiu
          // no nav). A borda por item abaixo produz a mesma separação visual
          // sem tocar a estrutura do `<ul>`.
          <Stack component='ul' aria-label={ariaLabel} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {rows.map((row, index) => (
              <Box
                component='li'
                key={getRowKey(row)}
                sx={{
                  p: 2,
                  borderTop: index > 0 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Stack spacing={1}>
                  {columns.map(column => (
                    <Box
                      key={column.key}
                      sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline' }}
                    >
                      <Typography variant='caption' color='text.secondary' sx={{ flexShrink: 0 }}>
                        {column.label}
                      </Typography>
                      <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                        {column.render
                          ? column.render(row)
                          : String((row as Record<string, unknown>)[column.key] ?? '')}
                      </Box>
                    </Box>
                  ))}
                </Stack>
                {hasRowActions && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>{rowActions?.(row)}</Box>
                )}
              </Box>
            ))}
          </Stack>
        )}

        {paginationControl}
      </Paper>
    )
  }

  return (
    <Paper variant='outlined' sx={{ width: '100%', overflow: 'hidden' }}>
      {toolbarRow}

      {/* `tabIndex`/`role`/`aria-label`: região com scroll horizontal precisa
          ser alcançável e identificável por teclado/leitor de tela — sem
          isso, quem só usa teclado não consegue rolar a tabela quando o
          conteúdo excede a largura disponível (achado real de auditoria). */}
      <TableContainer
        tabIndex={0}
        role='region'
        aria-label={`Tabela: ${ariaLabel}`}
        sx={{ maxWidth: '100%', overflowX: 'auto' }}
      >
        <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.key} align={column.align ?? 'left'} sx={{ width: column.width }}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.key}
                      direction={sortBy === column.key ? sortDirection : 'asc'}
                      onClick={() => onSortChange?.(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {hasRowActions && (
                <TableCell align='right' sx={{ width: 64 }}>
                  <Box component='span' sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
                    Ações
                  </Box>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasRowActions ? 1 : 0)}>
                  <LoadingScreen fullPage={false} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasRowActions ? 1 : 0)}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={getRowKey(row)} hover>
                  {columns.map(column => (
                    <TableCell key={column.key} align={column.align ?? 'left'}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </TableCell>
                  ))}
                  {hasRowActions && (
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{rowActions?.(row)}</Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {paginationControl}
    </Paper>
  )
}

function slugify(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'tabela'
  )
}
