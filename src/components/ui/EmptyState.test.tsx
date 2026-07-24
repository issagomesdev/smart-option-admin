import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renderiza título e descrição', () => {
    render(<EmptyState title='Nenhum resultado' description='Tente outro filtro.' />)
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument()
    expect(screen.getByText('Tente outro filtro.')).toBeInTheDocument()
  })

  it('descrição é opcional', () => {
    render(<EmptyState title='Nenhum resultado' />)
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument()
  })

  it('renderiza a action quando passada', () => {
    render(<EmptyState title='Nenhum resultado' action={<button>Recarregar</button>} />)
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument()
  })
})
