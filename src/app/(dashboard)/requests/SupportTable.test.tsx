import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { SessionProvider } from '@/components/shell/SessionContext'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import type { PaginatedSupport } from '@/domain/dtos/requests.dto'
import { SupportTable } from './SupportTable'

const listSupportRequestsAction = vi.fn()
const markSupportAsReadAction = vi.fn()

vi.mock('./requests.actions', () => ({
  listSupportRequestsAction: (...args: unknown[]) => listSupportRequestsAction(...args),
  markSupportAsReadAction: (...args: unknown[]) => markSupportAsReadAction(...args)
}))

const BASE_USER: SessionUser = {
  id: 1,
  name: 'Admin',
  surname: 'Teste',
  email: 'admin@test.local',
  roleId: 1,
  permissions: [],
  isDemo: false
}

function renderWithTheme(ui: React.ReactElement, permissions: string[] = ['support.write']) {
  return render(
    <ThemeProvider theme={theme}>
      <SessionProvider user={{ ...BASE_USER, permissions }}>{ui}</SessionProvider>
    </ThemeProvider>
  )
}

const RESULT: PaginatedSupport = {
  data: [
    {
      id: 9,
      type: 'support',
      subject: 'Não consigo sacar meu saldo',
      is_read: 0,
      user_id: 42,
      created_at: '15/07/2026',
      name: 'Ciclana'
    }
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
}

describe('SupportTable', () => {
  beforeEach(() => {
    listSupportRequestsAction.mockClear()
    markSupportAsReadAction.mockClear()
    listSupportRequestsAction.mockResolvedValue(RESULT)
  })

  it('marcar o checkbox como concluído chama a action e recarrega a lista', async () => {
    markSupportAsReadAction.mockResolvedValue(undefined)
    renderWithTheme(<SupportTable userId='all' />)

    const checkbox = await screen.findByRole('checkbox', { name: 'Concluído — solicitação #9' })
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeEnabled()

    await userEvent.click(checkbox)

    await waitFor(() => expect(markSupportAsReadAction).toHaveBeenCalledWith(9, 1))
    await waitFor(() => expect(listSupportRequestsAction).toHaveBeenCalledTimes(2))
  })

  it('"Visualizar" abre o modal de detalhes com o assunto e link para o usuário', async () => {
    renderWithTheme(<SupportTable userId='all' />)

    await userEvent.click(await screen.findByRole('button', { name: 'Visualizar' }))

    expect(screen.getByText('Não consigo sacar meu saldo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver perfil do usuário' })).toHaveAttribute('href', '/users/42')
  })

  it('sem support.write, o checkbox de concluído fica desabilitado', async () => {
    renderWithTheme(<SupportTable userId='all' />, [])

    // `toBeDisabled()` já é a prova que importa aqui: um checkbox desabilitado
    // (`pointer-events: none`) nem chega a receber o clique de um usuário
    // real — `userEvent.click` corretamente recusa simular essa interação.
    const checkbox = await screen.findByRole('checkbox', { name: 'Concluído — solicitação #9' })
    expect(checkbox).toBeDisabled()
    expect(markSupportAsReadAction).not.toHaveBeenCalled()
  })

  it('clicar num cabeçalho ordenável repassa sortBy/sortDirection para listSupportRequestsAction', async () => {
    renderWithTheme(<SupportTable userId='all' />)
    await screen.findByText('Ciclana')
    listSupportRequestsAction.mockClear()

    await userEvent.click(screen.getByText('Data'))

    await waitFor(() =>
      expect(listSupportRequestsAction).toHaveBeenCalledWith(
        'all',
        expect.objectContaining({ sortBy: 'created_at', sortDirection: 'asc' })
      )
    )
  })
})
