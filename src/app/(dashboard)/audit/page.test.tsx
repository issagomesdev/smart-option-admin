import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { PaginatedAudit } from '@/domain/dtos/audit.dto'
import AuditPage from './page'

const listAuditMovementsAction = vi.fn()
vi.mock('./audit.actions', () => ({
  listAuditMovementsAction: (...args: unknown[]) => listAuditMovementsAction(...args)
}))

const searchBotUsersAction = vi.fn()
vi.mock('../dashboard.actions', () => ({
  searchBotUsersAction: (...args: unknown[]) => searchBotUsersAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const SAMPLE_RESULT: PaginatedAudit = {
  data: [
    {
      id: 'wt-1',
      source: 'wallet_transaction',
      kind: 'deposit',
      direction: 'credit',
      amount: 200,
      status: 'concluido',
      gateway: 'Asaas (PIX)',
      userId: 42,
      userName: 'Fulano de Tal',
      telegramUserId: '5551234',
      referenceId: 'ref-1',
      responsibleAdmin: null,
      observations: null,
      createdAt: '2026-07-20T10:00:00.000Z',
      updatedAt: '2026-07-20T10:00:00.000Z'
    }
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
}

describe('AuditPage', () => {
  beforeEach(() => {
    listAuditMovementsAction.mockClear()
    searchBotUsersAction.mockClear()
    listAuditMovementsAction.mockResolvedValue(SAMPLE_RESULT)
  })

  it('carrega e mostra a movimentação, com o valor assinado e formatado', async () => {
    renderWithTheme(<AuditPage />)
    expect(await screen.findByText('Fulano de Tal')).toBeInTheDocument()
    expect(screen.getByText(/\+R\$\s*200,00/)).toBeInTheDocument()
  })

  it('"Ver detalhes" abre o diálogo com os campos completos da movimentação', async () => {
    renderWithTheme(<AuditPage />)
    await screen.findByText('Fulano de Tal')

    await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }))

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('Movimentação wt-1')).toBeInTheDocument()
    expect(dialog.getByText('Asaas (PIX)')).toBeInTheDocument()
    expect(dialog.getByText('5551234')).toBeInTheDocument()
    expect(dialog.getByText('Sistema (automático)')).toBeInTheDocument()
  })

  it('trocar o filtro de Tipo reseta a página e repassa o novo filtro para a action', async () => {
    renderWithTheme(<AuditPage />)
    await screen.findByText('Fulano de Tal')
    listAuditMovementsAction.mockClear()

    await userEvent.click(screen.getByLabelText('Tipo'))
    await userEvent.click(await screen.findByRole('option', { name: 'Depósito PIX' }))

    await waitFor(() =>
      expect(listAuditMovementsAction).toHaveBeenCalledWith(expect.objectContaining({ type: 'deposit', page: 1 }))
    )
  })

  it('clicar num cabeçalho ordenável repassa sortBy/sortDirection para a action', async () => {
    renderWithTheme(<AuditPage />)
    await screen.findByText('Fulano de Tal')
    listAuditMovementsAction.mockClear()

    await userEvent.click(within(screen.getByRole('columnheader', { name: 'Valor' })).getByText('Valor'))

    await waitFor(() =>
      expect(listAuditMovementsAction).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'amount', sortDirection: 'asc' })
      )
    )
  })

  it('período "Tudo" por padrão não envia `period` — histórico completo por padrão', async () => {
    renderWithTheme(<AuditPage />)
    await screen.findByText('Fulano de Tal')

    const [[firstCallFilters]] = listAuditMovementsAction.mock.calls
    expect(firstCallFilters.period).toBeUndefined()
  })

  it('erro ao carregar mostra um toast e não quebra a página', async () => {
    listAuditMovementsAction.mockRejectedValue(new Error('network'))
    renderWithTheme(<AuditPage />)

    await waitFor(() => expect(listAuditMovementsAction).toHaveBeenCalled())
    expect(screen.getByText('Nenhuma movimentação encontrada')).toBeInTheDocument()
  })
})
