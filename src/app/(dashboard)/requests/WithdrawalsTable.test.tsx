import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { SessionProvider } from '@/components/shell/SessionContext'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import type { PaginatedWithdrawals } from '@/domain/dtos/requests.dto'
import { WithdrawalsTable } from './WithdrawalsTable'

const listWithdrawalsAction = vi.fn()
const resolveWithdrawalAction = vi.fn()

vi.mock('./requests.actions', () => ({
  listWithdrawalsAction: (...args: unknown[]) => listWithdrawalsAction(...args),
  resolveWithdrawalAction: (...args: unknown[]) => resolveWithdrawalAction(...args)
}))

const BASE_USER: SessionUser = {
  id: 1,
  name: 'Admin',
  surname: 'Teste',
  email: 'admin@test.local',
  roleId: 1,
  permissions: []
}

function renderWithTheme(ui: React.ReactElement, permissions: string[] = ['withdrawals.approve']) {
  return render(
    <ThemeProvider theme={theme}>
      <SessionProvider user={{ ...BASE_USER, permissions }}>{ui}</SessionProvider>
    </ThemeProvider>
  )
}

const PENDING_RESULT: PaginatedWithdrawals = {
  data: [
    {
      id: 1,
      user_id: 42,
      value: '150.00',
      status: 'pending',
      reply_observation: null,
      errors_cause: null,
      reference_id: 'ref-1',
      transaction_id: null,
      created_at: '15/07/2026',
      name: 'Fulano de Tal'
    }
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
}

describe('WithdrawalsTable', () => {
  beforeEach(() => {
    listWithdrawalsAction.mockClear()
    resolveWithdrawalAction.mockClear()
    listWithdrawalsAction.mockResolvedValue(PENDING_RESULT)
  })

  it('mostra a coluna Usuário no modo global (userId="all") e não no modo por usuário', async () => {
    const { unmount } = renderWithTheme(<WithdrawalsTable userId='all' />)
    expect(await screen.findByText('Fulano de Tal')).toBeInTheDocument()
    unmount()

    renderWithTheme(<WithdrawalsTable userId={42} />)
    await waitFor(() => expect(listWithdrawalsAction).toHaveBeenLastCalledWith(42, expect.anything()))
    expect(screen.queryByText('Fulano de Tal')).not.toBeInTheDocument()
  })

  it('solicitação pendente mostra "Responder"; ao autorizar, chama a action e atualiza a lista', async () => {
    resolveWithdrawalAction.mockResolvedValue({ status: true, message: 'Solicitação respondida com sucesso!' })
    renderWithTheme(<WithdrawalsTable userId='all' />)

    await userEvent.click(await screen.findByRole('button', { name: 'Responder' }))
    expect(screen.getByText('Solicitação de saque #1')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Autorizar' }))

    await waitFor(() =>
      expect(resolveWithdrawalAction).toHaveBeenCalledWith({ id: 1, res: true, observation: undefined })
    )
    await waitFor(() => expect(listWithdrawalsAction).toHaveBeenCalledTimes(2))
  })

  it('solicitação já respondida mostra "Visualizar" e não permite autorizar/rejeitar', async () => {
    listWithdrawalsAction.mockResolvedValue({
      data: [{ ...PENDING_RESULT.data[0], status: 'success', reply_observation: 'Pago via PIX' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
    })
    renderWithTheme(<WithdrawalsTable userId='all' />)

    await userEvent.click(await screen.findByRole('button', { name: 'Visualizar' }))
    expect(screen.getByText('Observação: Pago via PIX')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Autorizar' })).not.toBeInTheDocument()
  })

  it('sem withdrawals.approve, uma solicitação pendente mostra "Visualizar" e o diálogo não permite responder', async () => {
    renderWithTheme(<WithdrawalsTable userId='all' />, [])

    await userEvent.click(await screen.findByRole('button', { name: 'Visualizar' }))

    expect(screen.getByText('Você não tem permissão para responder a esta solicitação.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Autorizar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rejeitar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })

  it('clicar num cabeçalho ordenável repassa sortBy/sortDirection para listWithdrawalsAction', async () => {
    renderWithTheme(<WithdrawalsTable userId='all' />)
    await screen.findByText('Fulano de Tal')
    listWithdrawalsAction.mockClear()

    await userEvent.click(within(screen.getByRole('columnheader', { name: 'Valor' })).getByText('Valor'))

    await waitFor(() =>
      expect(listWithdrawalsAction).toHaveBeenCalledWith('all', expect.objectContaining({ sortBy: 'value', sortDirection: 'asc' }))
    )
  })
})
