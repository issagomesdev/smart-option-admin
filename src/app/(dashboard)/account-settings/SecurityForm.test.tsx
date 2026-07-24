import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { ToastContainer } from '@/components/ui/toast'
import { SecurityForm } from './SecurityForm'

const updateStaffPasswordAction = vi.fn()

vi.mock('./account-settings.actions', () => ({
  updateStaffPasswordAction: (...args: unknown[]) => updateStaffPasswordAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
      <ToastContainer />
    </ThemeProvider>
  )
}

async function fillPasswords(current: string, next: string, confirm: string) {
  await userEvent.type(screen.getByLabelText('Senha atual'), current)
  await userEvent.type(screen.getByLabelText('Nova senha'), next)
  await userEvent.type(screen.getByLabelText('Repetir nova senha'), confirm)
}

describe('SecurityForm', () => {
  beforeEach(() => {
    updateStaffPasswordAction.mockClear()
  })

  it('bloqueia envio quando a nova senha tem menos de 8 caracteres', async () => {
    renderWithTheme(<SecurityForm />)

    await fillPasswords('senha-atual', 'curta', 'curta')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('A nova senha deve ter pelo menos 8 caracteres')).toBeInTheDocument()
    expect(updateStaffPasswordAction).not.toHaveBeenCalled()
  })

  it('bloqueia envio quando a confirmação não bate com a nova senha', async () => {
    renderWithTheme(<SecurityForm />)

    await fillPasswords('senha-atual', 'senha-nova-123', 'senha-diferente-123')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('As senhas digitadas não coincidem')).toBeInTheDocument()
    expect(updateStaffPasswordAction).not.toHaveBeenCalled()
  })

  it('envia a troca de senha e limpa o formulário em caso de sucesso', async () => {
    updateStaffPasswordAction.mockResolvedValue({ status: true })
    renderWithTheme(<SecurityForm />)

    await fillPasswords('senha-atual', 'senha-nova-123', 'senha-nova-123')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() =>
      expect(updateStaffPasswordAction).toHaveBeenCalledWith({
        currentPassword: 'senha-atual',
        newPassword: 'senha-nova-123'
      })
    )
    await waitFor(() => expect(screen.getByLabelText('Senha atual')).toHaveValue(''))
  })

  it('mostra a mensagem de erro vinda do backend (ex.: senha atual incorreta)', async () => {
    updateStaffPasswordAction.mockRejectedValue(
      new Error('A senha atual inserida não corresponde à senha da conta em questão.')
    )
    renderWithTheme(<SecurityForm />)

    await fillPasswords('senha-errada', 'senha-nova-123', 'senha-nova-123')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(
      await screen.findByText('A senha atual inserida não corresponde à senha da conta em questão.')
    ).toBeInTheDocument()
  })
})
