import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { ExtractResponse } from '@/domain/dtos/requests.dto'
import { ExtractTable } from './ExtractTable'

const getExtractAction = vi.fn()

vi.mock('./requests.actions', () => ({
  getExtractAction: (...args: unknown[]) => getExtractAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

function makeExtract(count: number): ExtractResponse {
  return {
    balance: 1234.5,
    extract: Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      type: index % 2 === 0 ? 'sum' : 'subtract',
      value: '10.00',
      origin: 'deposit',
      reference_id: null,
      created_at: '15/07/2026'
    }))
  }
}

describe('ExtractTable', () => {
  beforeEach(() => {
    getExtractAction.mockClear()
  })

  it('mostra o saldo atual e as linhas do extrato', async () => {
    getExtractAction.mockResolvedValue(makeExtract(3))
    renderWithTheme(<ExtractTable userId={42} />)

    expect(await screen.findByText('Saldo atual: R$ 1234.50')).toBeInTheDocument()
    expect(screen.getAllByText('Depósito')).toHaveLength(3)
  })

  it('pagina no cliente sobre a lista já carregada (backend não pagina o extrato)', async () => {
    getExtractAction.mockResolvedValue(makeExtract(25))
    renderWithTheme(<ExtractTable userId={42} />)

    await waitFor(() => expect(screen.getAllByText('Depósito')).toHaveLength(20))
    expect(screen.getByText('1–20 de 25')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }))

    await waitFor(() => expect(screen.getAllByText('Depósito')).toHaveLength(5))
    expect(getExtractAction).toHaveBeenCalledTimes(1)
  })
})
