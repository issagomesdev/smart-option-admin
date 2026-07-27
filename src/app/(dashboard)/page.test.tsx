import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { DashboardSummary } from '@/domain/dtos/dashboard.dto'
import DashboardPage from './page'

const getDashboardSummaryAction = vi.fn()
const getPlansAction = vi.fn()
const searchBotUsersAction = vi.fn()
vi.mock('./dashboard.actions', () => ({
  getDashboardSummaryAction: (...args: unknown[]) => getDashboardSummaryAction(...args),
  getPlansAction: (...args: unknown[]) => getPlansAction(...args),
  searchBotUsersAction: (...args: unknown[]) => searchBotUsersAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const ZERO_KPI = { value: 0, previousValue: 0, change: 0, changeType: 'percentage' as const }

const SAMPLE_SUMMARY: DashboardSummary = {
  kpis: {
    activeUsers: ZERO_KPI,
    networkBalance: ZERO_KPI,
    deposits: ZERO_KPI,
    pendingWithdrawals: { ...ZERO_KPI, changeType: 'absolute', currentBacklog: 0 }
  },
  chart: { granularity: 'day', points: [] },
  approvedToday: { count: 0, total: 0, percent: null },
  recentMovements: []
}

describe('DashboardPage', () => {
  beforeEach(() => {
    getDashboardSummaryAction.mockClear()
    getPlansAction.mockClear()
    searchBotUsersAction.mockClear()
    getDashboardSummaryAction.mockResolvedValue(SAMPLE_SUMMARY)
    getPlansAction.mockResolvedValue([])
  })

  it('mostra "Tudo" como a primeira opção do seletor de período, antes de "Hoje"', async () => {
    renderWithTheme(<DashboardPage />)
    await waitFor(() => expect(getDashboardSummaryAction).toHaveBeenCalled())

    const periodGroup = screen.getByRole('group', { name: 'Período' })
    const buttonLabels = Array.from(periodGroup.querySelectorAll('button')).map(button => button.textContent)
    expect(buttonLabels).toEqual(['Tudo', 'Hoje', '7 dias', '30 dias', 'Personalizado'])
  })

  it('"Limpar filtros" volta ao período "Tudo" e some com o recorte de usuário/plano', async () => {
    renderWithTheme(<DashboardPage />)
    await waitFor(() => expect(getDashboardSummaryAction).toHaveBeenCalled())

    // Muda o período pra "30 dias" — o botão de limpar deve ficar disponível.
    await userEvent.click(screen.getByRole('button', { name: '30 dias' }))
    await waitFor(() =>
      expect(getDashboardSummaryAction).toHaveBeenLastCalledWith(expect.objectContaining({ period: '30d' }))
    )

    const clearButton = screen.getByRole('button', { name: 'Limpar filtros' })
    expect(clearButton).toBeEnabled()

    await userEvent.click(clearButton)

    await waitFor(() => expect(getDashboardSummaryAction).toHaveBeenLastCalledWith({ period: 'all' }))
    expect(screen.getByRole('button', { name: 'Tudo' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('"Limpar filtros" começa desabilitado quando já não há filtro nenhum aplicado', async () => {
    renderWithTheme(<DashboardPage />)
    await waitFor(() => expect(getDashboardSummaryAction).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Tudo' }))
    await waitFor(() => expect(getDashboardSummaryAction).toHaveBeenLastCalledWith({ period: 'all' }))

    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeDisabled()
  })
})
