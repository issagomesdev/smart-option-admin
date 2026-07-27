import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { NetworkResponse } from '@/domain/dtos/network.dto'
import { NetworkTable } from './NetworkTable'

const getNetworkAction = vi.fn()

vi.mock('./requests.actions', () => ({
  getNetworkAction: (...args: unknown[]) => getNetworkAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const RESPONSE: NetworkResponse = {
  guests: {
    data: [{ id: 10, name: 'Indicado Um', level: '1', status: 1 }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
  },
  affiliates: {
    data: [{ id: 20, name: 'Quem Indicou', level: '1', status: 1 }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
  }
}

describe('NetworkTable', () => {
  beforeEach(() => {
    getNetworkAction.mockClear()
    getNetworkAction.mockResolvedValue(RESPONSE)
  })

  it('mostra "Afiliados" (guests) por padrão e alterna para "Afiliação" (affiliates)', async () => {
    renderWithTheme(<NetworkTable userId={42} />)

    expect(await screen.findByText('Indicado Um')).toBeInTheDocument()
    expect(screen.queryByText('Quem Indicou')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Afiliação/ }))

    await waitFor(() => expect(screen.getByText('Quem Indicou')).toBeInTheDocument())
    expect(screen.queryByText('Indicado Um')).not.toBeInTheDocument()
  })

  it('linka cada membro para o perfil do usuário', async () => {
    renderWithTheme(<NetworkTable userId={42} />)

    const link = await screen.findByRole('link', { name: 'Indicado Um' })
    expect(link).toHaveAttribute('href', '/users/10')
  })

  it('clicar num cabeçalho ordenável repassa sortBy/sortDirection para getNetworkAction (mesmo filtro para guests e affiliates)', async () => {
    renderWithTheme(<NetworkTable userId={42} />)
    await screen.findByText('Indicado Um')
    getNetworkAction.mockClear()

    await userEvent.click(within(screen.getByRole('columnheader', { name: 'Nome' })).getByText('Nome'))

    await waitFor(() =>
      expect(getNetworkAction).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ sortBy: 'name', sortDirection: 'asc' })
      )
    )
  })
})
