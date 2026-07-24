import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { DataTable, type DataTableColumn } from './DataTable'

/**
 * Abaixo do breakpoint `sm`, `DataTable` troca a tabela por uma lista de
 * cards (achado real de auditoria de UX — a tabela HTML não refluía em
 * celular, só estourava a largura da tela). `jsdom` não aplica media queries
 * de verdade — `useMediaQuery` mockado para simular a viewport mobile, mesmo
 * padrão de `DashboardShell.test.tsx`. Em arquivo próprio porque `vi.mock` é
 * içado para o topo do módulo inteiro — não dá pra alternar entre mockado e
 * não-mockado dentro do mesmo arquivo de `DataTable.test.tsx` (que cobre o
 * caminho desktop/tabela).
 */
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => true }))

interface Row {
  id: number
  name: string
}

const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Nome' },
  { key: 'id', label: 'ID' }
]

const rows: Row[] = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Bruno' }
]

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const basePagination = { page: 1, limit: 20, total: 2, totalPages: 1 }

describe('DataTable (viewport mobile)', () => {
  it('renderiza as linhas como uma lista de cards, não como tabela', () => {
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        pagination={basePagination}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Tabela de teste' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
  })

  it('mostra EmptyState quando rows=[]', () => {
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={[]}
        getRowKey={row => row.id}
        pagination={{ ...basePagination, total: 0 }}
        onPageChange={vi.fn()}
        emptyTitle='Nenhum usuário encontrado'
      />
    )

    expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Tabela de teste' })).not.toBeInTheDocument()
  })

  it('mostra o spinner de loading em vez das linhas quando loading=true', () => {
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        pagination={basePagination}
        onPageChange={vi.fn()}
        loading
      />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
  })

  it('renderiza rowActions por card', () => {
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        pagination={basePagination}
        onPageChange={vi.fn()}
        rowActions={row => <button aria-label={`Excluir ${row.name}`}>x</button>}
      />
    )

    expect(screen.getByRole('button', { name: 'Excluir Ana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir Bruno' })).toBeInTheDocument()
  })
})
