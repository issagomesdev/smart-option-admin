import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { theme } from '@/theme/theme'
import { colorTokens } from '@/theme/tokens'
import { TrendBadge } from './TrendBadge'

function hexToRgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16)
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
}

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('TrendBadge', () => {
  it('formata percentual positivo com sinal e cor de sucesso (positive-is-good por padrão)', () => {
    renderWithTheme(<TrendBadge value={8.4} />)
    const text = screen.getByText('+8.4%')
    expect(text).toBeInTheDocument()
    // `color: inherit` no próprio <span> — a cor real vem do Box pai; resolvida aqui via
    // `getComputedStyle` (que já aplica a herança), não pelo literal 'inherit'.
    expect(getComputedStyle(text).color).toBe(hexToRgb(colorTokens.emerald[700]))
  })

  it('formata percentual negativo como notícia ruim por padrão', () => {
    renderWithTheme(<TrendBadge value={-12.5} />)
    expect(screen.getByText('-12.5%')).toBeInTheDocument()
  })

  it('valor zero não leva sinal e usa o tom neutro', () => {
    renderWithTheme(<TrendBadge value={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('format="absolute" não usa símbolo de percentual (ex.: saques pendentes)', () => {
    renderWithTheme(<TrendBadge value={-3} format='absolute' />)
    expect(screen.getByText('-3')).toBeInTheDocument()
    expect(screen.queryByText('-3%')).not.toBeInTheDocument()
  })

  it('polarity="negative-is-good" inverte qual direção é a notícia boa', () => {
    renderWithTheme(<TrendBadge value={-3} format='absolute' polarity='negative-is-good' />)
    expect(getComputedStyle(screen.getByText('-3')).color).toBe(hexToRgb(colorTokens.emerald[700]))

    renderWithTheme(<TrendBadge value={3} format='absolute' polarity='negative-is-good' />)
    expect(getComputedStyle(screen.getByText('+3')).color).toBe(hexToRgb(colorTokens.red[700]))
  })
})
