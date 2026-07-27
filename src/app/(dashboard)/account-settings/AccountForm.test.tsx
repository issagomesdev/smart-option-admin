import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import { AccountForm } from './AccountForm'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh })
}))

const updateStaffUserAction = vi.fn()

vi.mock('./account-settings.actions', () => ({
  updateStaffUserAction: (...args: unknown[]) => updateStaffUserAction(...args)
}))

const USER: SessionUser = {
  id: 1,
  name: 'Sr',
  surname: 'Admin',
  email: 'admin@admin.com',
  roleId: 1,
  permissions: [],
  isDemo: false
}

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('AccountForm', () => {
  beforeEach(() => {
    refresh.mockClear()
    updateStaffUserAction.mockClear()
  })

  it('pré-preenche os campos com os dados da sessão atual', () => {
    renderWithTheme(<AccountForm user={USER} />)

    expect(screen.getByLabelText('Nome')).toHaveValue('Sr')
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('Admin')
    expect(screen.getByLabelText('E-mail')).toHaveValue('admin@admin.com')
  })

  it('mostra erro de validação e não chama a action com e-mail inválido', async () => {
    renderWithTheme(<AccountForm user={USER} />)

    const emailField = screen.getByLabelText('E-mail')
    await userEvent.clear(emailField)
    await userEvent.type(emailField, 'nao-e-um-email')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
    expect(updateStaffUserAction).not.toHaveBeenCalled()
  })

  it('envia os campos alterados e chama router.refresh() (mesma rota, atualiza o menu do usuário)', async () => {
    updateStaffUserAction.mockResolvedValue({ status: true })
    renderWithTheme(<AccountForm user={USER} />)

    const nameField = screen.getByLabelText('Nome')
    await userEvent.clear(nameField)
    await userEvent.type(nameField, 'Novo Nome')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() =>
      expect(updateStaffUserAction).toHaveBeenCalledWith({
        name: 'Novo Nome',
        surname: 'Admin',
        email: 'admin@admin.com'
      })
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })
})
