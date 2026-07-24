import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingScreen } from './LoadingScreen'

describe('LoadingScreen', () => {
  it('expõe role="progressbar" (acessibilidade nativa do MUI CircularProgress)', () => {
    render(<LoadingScreen />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renderiza o label customizado', () => {
    render(<LoadingScreen label='Buscando solicitações...' />)
    expect(screen.getByText('Buscando solicitações...')).toBeInTheDocument()
  })

  it('sem label, não renderiza texto nenhum', () => {
    render(<LoadingScreen label='' />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
