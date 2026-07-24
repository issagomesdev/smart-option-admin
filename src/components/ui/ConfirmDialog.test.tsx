import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { ConfirmDialog } from './ConfirmDialog'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('ConfirmDialog', () => {
  it('não renderiza nada quando open=false', () => {
    renderWithTheme(<ConfirmDialog open={false} title='Excluir?' onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByText('Excluir?')).not.toBeInTheDocument()
  })

  it('mostra título/descrição e dispara onConfirm/onCancel — substitui o window.confirm() nativo da auditoria', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    renderWithTheme(
      <ConfirmDialog
        open
        title='Excluir usuário?'
        description='Essa ação não pode ser desfeita.'
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByText('Excluir usuário?')).toBeInTheDocument()
    expect(screen.getByText('Essa ação não pode ser desfeita.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('loading desabilita os dois botões', () => {
    renderWithTheme(<ConfirmDialog open title='Excluir?' loading onConfirm={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
  })

  it('aceita labels customizados', () => {
    renderWithTheme(
      <ConfirmDialog
        open
        title='Bloquear usuário?'
        confirmLabel='Bloquear'
        cancelLabel='Voltar'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Bloquear' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
  })
})
