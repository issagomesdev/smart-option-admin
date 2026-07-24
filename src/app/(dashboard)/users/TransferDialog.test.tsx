import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { TransferDialog } from './TransferDialog'

const transferValuesAction = vi.fn()

vi.mock('./users.actions', () => ({
  transferValuesAction: (...args: unknown[]) => transferValuesAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('TransferDialog', () => {
  beforeEach(() => {
    transferValuesAction.mockClear()
  })

  it('não renderiza nada quando userId é null', () => {
    renderWithTheme(<TransferDialog userId={null} onClose={vi.fn()} onDone={vi.fn()} />)
    expect(screen.queryByText('Ajustar saldo do usuário')).not.toBeInTheDocument()
  })

  it('bloqueia envio sem valor preenchido', async () => {
    renderWithTheme(<TransferDialog userId={7} onClose={vi.fn()} onDone={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(transferValuesAction).not.toHaveBeenCalled()
  })

  it('envia type=sum por padrão e chama onDone em caso de sucesso', async () => {
    transferValuesAction.mockResolvedValue(undefined)
    const onDone = vi.fn()
    renderWithTheme(<TransferDialog userId={7} onClose={vi.fn()} onDone={onDone} />)

    await userEvent.type(screen.getByLabelText('Valor'), '150')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(transferValuesAction).toHaveBeenCalledWith({ user_id: 7, value: '150', type: 'sum' }))
    expect(onDone).toHaveBeenCalled()
  })

  it('permite trocar para subtract', async () => {
    transferValuesAction.mockResolvedValue(undefined)
    renderWithTheme(<TransferDialog userId={7} onClose={vi.fn()} onDone={vi.fn()} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: '− Subtrair' }))
    await userEvent.type(screen.getByLabelText('Valor'), '50')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() =>
      expect(transferValuesAction).toHaveBeenCalledWith({ user_id: 7, value: '50', type: 'subtract' })
    )
  })
})
