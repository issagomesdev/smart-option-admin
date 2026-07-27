import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { theme } from '@/theme/theme'
import { RentabilidadeChart } from './RentabilidadeChart'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const DATA = [
  { bucket: '2026-07-01', total: 100 },
  { bucket: '2026-07-02', total: 200 },
  { bucket: '2026-07-03', total: 50 }
]

describe('RentabilidadeChart', () => {
  it('expõe um aria-label resumindo o intervalo de valores', () => {
    renderWithTheme(<RentabilidadeChart data={DATA} granularity='day' />)
    const svg = screen.getByRole('img')
    expect(svg.getAttribute('aria-label')).toMatch(/R\$\s*100,00/)
    expect(svg.getAttribute('aria-label')).toMatch(/R\$\s*50,00/)
  })

  it('inclui uma tabela com os mesmos dados, como alternativa acessível ao gráfico', () => {
    renderWithTheme(<RentabilidadeChart data={DATA} granularity='day' />)
    const table = screen.getByRole('table', { hidden: true })
    expect(table).toBeInTheDocument()
    expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(DATA.length + 1) // + cabeçalho
  })

  it('navegação por teclado (seta direita) move o ponto ativo e mostra o tooltip', async () => {
    renderWithTheme(<RentabilidadeChart data={DATA} granularity='day' />)
    const svg = screen.getByRole('img')
    svg.focus()
    await userEvent.keyboard('{ArrowRight}')
    // O mesmo valor também existe na tabela oculta (mesmos dados) — confirma especificamente a
    // instância do tooltip, fora da `<table>`. Regex em vez de string literal porque
    // `Intl.NumberFormat('pt-BR', {style:'currency'})` usa um espaço não-quebrável (NBSP) entre
    // "R$" e o número, não um espaço comum.
    const matches = screen.getAllByText(/R\$\s*100,00/)
    expect(matches.some(el => !el.closest('table'))).toBe(true)
  })

  it('não lança com uma lista de dados vazia', () => {
    expect(() => renderWithTheme(<RentabilidadeChart data={[]} granularity='day' />)).not.toThrow()
  })

  it('granularity="month" formata os rótulos como mês/ano', () => {
    renderWithTheme(<RentabilidadeChart data={[{ bucket: '2026-07', total: 10 }]} granularity='month' />)
    const table = screen.getByRole('table', { hidden: true })
    expect(table.textContent).toMatch(/jul.*26/i)
  })
})
