import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { theme } from '@/theme/theme'
import { StatusBadge, booleanStatusToBadge, checkoutStatusToBadge, withdrawalStatusToBadge } from './StatusBadge'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('StatusBadge', () => {
  it('renderiza o label passado', () => {
    renderWithTheme(<StatusBadge label='Pendente' tone='warning' />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })
})

describe('checkoutStatusToBadge', () => {
  it('mapeia os 6 status reais de checkouts.status sem lançar', () => {
    const statuses = ['PENDING', 'AUTHORIZED', 'PAID', 'IN_ANALYSIS', 'DECLINED', 'CANCELED'] as const
    for (const status of statuses) {
      const { label, tone } = checkoutStatusToBadge(status)
      expect(label).toBeTruthy()
      expect(['success', 'warning', 'error', 'info', 'neutral']).toContain(tone)
    }
  })

  it('PAID mapeia para tone success', () => {
    expect(checkoutStatusToBadge('PAID').tone).toBe('success')
  })

  it('DECLINED mapeia para tone error', () => {
    expect(checkoutStatusToBadge('DECLINED').tone).toBe('error')
  })
})

describe('withdrawalStatusToBadge', () => {
  it('mapeia os 5 status reais de withdrawals.status sem lançar', () => {
    const statuses = ['pending', 'authorized', 'success', 'refused', 'failed'] as const
    for (const status of statuses) {
      const { label, tone } = withdrawalStatusToBadge(status)
      expect(label).toBeTruthy()
      expect(['success', 'warning', 'error', 'info', 'neutral']).toContain(tone)
    }
  })

  it('success mapeia para tone success', () => {
    expect(withdrawalStatusToBadge('success').tone).toBe('success')
  })

  it('failed e refused mapeiam para tone error', () => {
    expect(withdrawalStatusToBadge('failed').tone).toBe('error')
    expect(withdrawalStatusToBadge('refused').tone).toBe('error')
  })
})

describe('booleanStatusToBadge', () => {
  it('true vira "Ativo"/success, false vira "Inativo"/neutral', () => {
    expect(booleanStatusToBadge(true)).toEqual({ label: 'Ativo', tone: 'success' })
    expect(booleanStatusToBadge(false)).toEqual({ label: 'Inativo', tone: 'neutral' })
  })
})
