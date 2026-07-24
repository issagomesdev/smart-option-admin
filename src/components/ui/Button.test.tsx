import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { Button } from './Button'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('Button', () => {
  it('renderiza como um <button> de verdade (semântica/foco por teclado, ao contrário do <Box onClick> da auditoria)', () => {
    renderWithTheme(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('dispara onClick ao clicar', async () => {
    const onClick = vi.fn()
    renderWithTheme(<Button onClick={onClick}>Salvar</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('loading desabilita o botão e não dispara onClick', async () => {
    const onClick = vi.fn()
    renderWithTheme(
      <Button loading onClick={onClick}>
        Salvar
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Salvar' })
    expect(button).toBeDisabled()
    await userEvent.click(button, { pointerEventsCheck: 0 })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('intent="danger" aplica a cor de erro do tema', () => {
    renderWithTheme(<Button intent='danger'>Excluir</Button>)
    const button = screen.getByRole('button', { name: 'Excluir' })
    expect(button.className).toMatch(/colorError/)
  })
})
