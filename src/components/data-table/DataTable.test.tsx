import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: number
  name: string
}

const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Nome', sortable: true },
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

describe('DataTable', () => {
  it('renderiza as linhas e colunas', () => {
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

    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
  })

  it('mostra EmptyState quando rows=[] (substitui as 6 mensagens de vazio duplicadas da auditoria)', () => {
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

  it('dispara onSortChange com a key da coluna ao clicar no cabeçalho ordenável', async () => {
    const onSortChange = vi.fn()
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        pagination={basePagination}
        onPageChange={vi.fn()}
        onSortChange={onSortChange}
      />
    )

    await userEvent.click(screen.getByText('Nome'))
    expect(onSortChange).toHaveBeenCalledWith('name')
  })

  it('dispara onPageChange (1-indexado) ao ir para a próxima página', async () => {
    const onPageChange = vi.fn()
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        pagination={{ page: 1, limit: 2, total: 4, totalPages: 2 }}
        onPageChange={onPageChange}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('renderiza rowActions por linha', () => {
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

  it('renderiza a toolbar quando passada', () => {
    renderWithTheme(
      <DataTable
        ariaLabel='Tabela de teste'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        pagination={basePagination}
        onPageChange={vi.fn()}
        toolbar={<input placeholder='Filtrar' />}
      />
    )

    expect(screen.getByPlaceholderText('Filtrar')).toBeInTheDocument()
  })
})
