import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { SessionProvider } from '@/components/shell/SessionContext'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import type { Role } from '@/domain/dtos/roles.dto'
import { RoleForm } from './RoleForm'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push })
}))

const createRoleAction = vi.fn()
const updateRoleAction = vi.fn()

vi.mock('./roles.actions', () => ({
  createRoleAction: (...args: unknown[]) => createRoleAction(...args),
  updateRoleAction: (...args: unknown[]) => updateRoleAction(...args)
}))

function renderWithSession(ui: React.ReactElement, permissions: string[]) {
  const user: SessionUser = {
    id: 1,
    name: 'Admin',
    surname: 'Teste',
    email: 'admin@test.local',
    roleId: 1,
    permissions
  }
  return render(
    <ThemeProvider theme={theme}>
      <SessionProvider user={user}>{ui}</SessionProvider>
    </ThemeProvider>
  )
}

describe('RoleForm', () => {
  beforeEach(() => {
    push.mockClear()
    createRoleAction.mockClear()
    updateRoleAction.mockClear()
  })

  it('modo create: desabilita checkboxes de permissões que o ator não possui', () => {
    renderWithSession(<RoleForm mode='create' />, ['support.write'])

    const supportCheckbox = screen.getByRole('checkbox', { name: /Marcar solicitações de suporte/ })
    const financeCheckbox = screen.getByRole('checkbox', { name: /Ajustar saldo manualmente/ })

    expect(supportCheckbox).toBeEnabled()
    expect(financeCheckbox).toBeDisabled()
  })

  it('modo create: marca uma permissão que o ator possui e envia no submit', async () => {
    createRoleAction.mockResolvedValue({ id: 9 })
    renderWithSession(<RoleForm mode='create' />, ['support.write'])

    await userEvent.type(screen.getByLabelText('Nome'), 'moderador')
    await userEvent.click(screen.getByRole('checkbox', { name: /Marcar solicitações de suporte/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() =>
      expect(createRoleAction).toHaveBeenCalledWith({
        name: 'moderador',
        description: undefined,
        permissions: ['support.write']
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/team/roles'))
  })

  it('modo edit: pré-marca as permissões atuais do papel e permite salvar', async () => {
    updateRoleAction.mockResolvedValue({ id: 8 })
    const initialValues: Role = {
      id: 8,
      name: 'moderador',
      description: 'Papel de teste',
      permissions: ['support.write'],
      isSystem: false,
      createdAt: '',
      updatedAt: ''
    }
    renderWithSession(<RoleForm mode='edit' roleId={8} initialValues={initialValues} />, ['support.write'])

    const supportCheckbox = screen.getByRole('checkbox', { name: /Marcar solicitações de suporte/ })
    expect(supportCheckbox).toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() =>
      expect(updateRoleAction).toHaveBeenCalledWith(8, {
        name: 'moderador',
        description: 'Papel de teste',
        permissions: ['support.write']
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/team/roles'))
  })
})
