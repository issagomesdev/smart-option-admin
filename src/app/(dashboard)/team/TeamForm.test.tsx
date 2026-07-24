import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { Role } from '@/domain/dtos/roles.dto'
import type { StaffDetail } from '@/domain/dtos/staff.dto'
import { TeamForm } from './TeamForm'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push })
}))

const listRolesAction = vi.fn()
const createStaffAction = vi.fn()
const reassignStaffRoleAction = vi.fn()

vi.mock('./team.actions', () => ({
  listRolesAction: (...args: unknown[]) => listRolesAction(...args),
  createStaffAction: (...args: unknown[]) => createStaffAction(...args),
  reassignStaffRoleAction: (...args: unknown[]) => reassignStaffRoleAction(...args)
}))

const ROLES: Role[] = [
  { id: 1, name: 'admin', description: null, permissions: [], isSystem: true, createdAt: '', updatedAt: '' },
  { id: 2, name: 'staff', description: null, permissions: [], isSystem: true, createdAt: '', updatedAt: '' }
]

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('TeamForm', () => {
  beforeEach(() => {
    push.mockClear()
    listRolesAction.mockClear()
    createStaffAction.mockClear()
    reassignStaffRoleAction.mockClear()
    listRolesAction.mockResolvedValue(ROLES)
  })

  it('modo create: bloqueia envio sem senha mesmo com os demais campos válidos', async () => {
    renderWithTheme(<TeamForm mode='create' />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Novo')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Staff')
    await userEvent.type(screen.getByLabelText('E-mail'), 'novo-staff@test.local')

    await userEvent.click(screen.getByLabelText('Papel'))
    await userEvent.click(await screen.findByRole('option', { name: 'staff' }))

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(createStaffAction).not.toHaveBeenCalled()
  })

  it('modo create: envia todos os campos e redireciona para /team em caso de sucesso', async () => {
    createStaffAction.mockResolvedValue({ id: 9 })
    renderWithTheme(<TeamForm mode='create' />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Novo')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Staff')
    await userEvent.type(screen.getByLabelText('E-mail'), 'novo-staff@test.local')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-forte-123')

    await userEvent.click(screen.getByLabelText('Papel'))
    await userEvent.click(await screen.findByRole('option', { name: 'staff' }))

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() =>
      expect(createStaffAction).toHaveBeenCalledWith({
        name: 'Novo',
        surname: 'Staff',
        email: 'novo-staff@test.local',
        password: 'senha-forte-123',
        roleId: 2
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/team'))
  })

  it('modo edit: não mostra campos de nome/e-mail/senha, só o papel (pré-selecionado)', async () => {
    const initialValues: StaffDetail = {
      id: 9,
      name: 'Existente',
      surname: 'Staff',
      email: 'existente@test.local',
      roleId: 2,
      roleName: 'staff',
      isActive: 1,
      createdAt: '2026-07-01T00:00:00.000Z'
    }
    renderWithTheme(<TeamForm mode='edit' staffId={9} initialValues={initialValues} />)

    expect(screen.getByText('Existente Staff')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getByLabelText('Papel')).toHaveTextContent('staff'))
  })

  it('modo edit: reatribui o papel e redireciona para /team', async () => {
    reassignStaffRoleAction.mockResolvedValue({ id: 9 })
    const initialValues: StaffDetail = {
      id: 9,
      name: 'Existente',
      surname: 'Staff',
      email: 'existente@test.local',
      roleId: 2,
      roleName: 'staff',
      isActive: 1,
      createdAt: '2026-07-01T00:00:00.000Z'
    }
    renderWithTheme(<TeamForm mode='edit' staffId={9} initialValues={initialValues} />)

    await userEvent.click(screen.getByLabelText('Papel'))
    await userEvent.click(await screen.findByRole('option', { name: 'admin' }))

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(reassignStaffRoleAction).toHaveBeenCalledWith(9, 1))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/team'))
  })
})
