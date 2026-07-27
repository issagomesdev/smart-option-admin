import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { theme } from '@/theme/theme'
import { RadialProgress } from './RadialProgress'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('RadialProgress', () => {
  it('renderiza o percentual formatado no centro do anel', () => {
    renderWithTheme(<RadialProgress percent={72} />)
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('percent=0 mostra "0%", não "—"', () => {
    renderWithTheme(<RadialProgress percent={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('percent=null mostra "—" em vez de "0%" enganoso', () => {
    renderWithTheme(<RadialProgress percent={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })

  it('exibe o label opcional abaixo do percentual', () => {
    renderWithTheme(<RadialProgress percent={50} label='aprovadas' />)
    expect(screen.getByText('aprovadas')).toBeInTheDocument()
  })

  it('renderiza os dois anéis (trilha + preenchimento) sobrepostos, do mesmo tamanho entre si', () => {
    const { container } = renderWithTheme(<RadialProgress percent={50} size={100} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
    // Verifica que os dois recebem o mesmo `size` (comparação relativa, não um pixel absoluto
    // hardcoded — implementação de sizing é interna ao `CircularProgress` do MUI) e que mudar o
    // `size` realmente se propaga (contra os dois ficarem sempre no tamanho default de 40px).
    const [track, fill] = Array.from(svgs).map(svg => getComputedStyle(svg).width)
    expect(track).toBe(fill)
    expect(track).not.toBe('40px')
  })
})
