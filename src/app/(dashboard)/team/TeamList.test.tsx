import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { SessionProvider } from '@/components/shell/SessionContext'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import type { PaginatedStaff } from '@/domain/dtos/staff.dto'
import { TeamList } from './TeamList'

const listStaffAction = vi.fn()
const deleteStaffAction = vi.fn()

vi.mock('./team.actions', () => ({
  listStaffAction: (...args: unknown[]) => listStaffAction(...args),
  deleteStaffAction: (...args: unknown[]) => deleteStaffAction(...args)
}))

const CURRENT_USER: SessionUser = {
  id: 8,
  name: 'Novo',
  surname: 'Staff',
  email: 'novo-staff@test.local',
  roleId: 1,
  permissions: ['staff.manage'],
  isDemo: false
}

function renderWithSession(permissions: string[] = CURRENT_USER.permissions) {
  return render(
    <ThemeProvider theme={theme}>
      <SessionProvider user={{ ...CURRENT_USER, permissions }}>
        <TeamList />
      </SessionProvider>
    </ThemeProvider>
  )
}

const RESULT: PaginatedStaff = {
  data: [
    {
      id: 1,
      name: 'Admin',
      surname: 'Teste',
      email: 'admin@test.local',
      roleId: 1,
      roleName: 'admin',
      isActive: 1,
      createdAt: '2026-07-01T00:00:00.000Z'
    },
    {
      id: 8,
      name: 'Novo',
      surname: 'Staff',
      email: 'novo-staff@test.local',
      roleId: 2,
      roleName: 'staff',
      isActive: 1,
      createdAt: '2026-07-10T00:00:00.000Z'
    },
    {
      id: 12,
      name: 'Outro',
      surname: 'Colaborador',
      email: 'outro@test.local',
      roleId: 2,
      roleName: 'staff',
      isActive: 1,
      createdAt: '2026-07-12T00:00:00.000Z'
    }
  ],
  pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
}

describe('TeamList', () => {
  it('lista o nome completo, e-mail e papel de cada staff', async () => {
    listStaffAction.mockResolvedValue(RESULT)
    renderWithSession()

    expect(await screen.findByText('Novo Staff')).toBeInTheDocument()
    // Escopado à linha: mais de um colaborador tem o papel 'staff' na fixture.
    const row = screen.getByRole('row', { name: /novo-staff@test.local/ })
    expect(within(row).getByText('novo-staff@test.local')).toBeInTheDocument()
    expect(within(row).getByText('staff')).toBeInTheDocument()
  })

  it('esconde "Excluir" no administrador principal e na linha do staff logado, mostra nas demais', async () => {
    listStaffAction.mockResolvedValue(RESULT)
    renderWithSession()

    await screen.findByText('Outro Colaborador')

    // id 1: protegido incondicionalmente, mesmo não sendo o usuário logado.
    expect(screen.queryByRole('button', { name: /Excluir Admin Teste/ })).not.toBeInTheDocument()
    // Próprio logado (id 8): o backend recusa auto-exclusão.
    expect(screen.queryByRole('button', { name: /Excluir Novo Staff/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir Outro Colaborador' })).toBeInTheDocument()
  })

  it('mostra o botão "Novo staff" apontando para /team/create', async () => {
    listStaffAction.mockResolvedValue(RESULT)
    renderWithSession()

    await screen.findByText('Novo Staff')
    expect(screen.getByRole('link', { name: /Novo staff/ })).toHaveAttribute('href', '/team/create')
  })

  it('esconde "Gerenciar papéis" sem roles.manage e mostra com roles.manage', async () => {
    listStaffAction.mockResolvedValue(RESULT)
    renderWithSession(['staff.manage'])
    await screen.findByText('Novo Staff')
    expect(screen.queryByRole('link', { name: /Gerenciar papéis/ })).not.toBeInTheDocument()

    listStaffAction.mockResolvedValue(RESULT)
    renderWithSession(['staff.manage', 'roles.manage'])
    await screen.findAllByText('Novo Staff')
    expect(screen.getByRole('link', { name: /Gerenciar papéis/ })).toHaveAttribute('href', '/team/roles')
  })

  it('clicar num cabeçalho ordenável repassa sortBy/sortDirection para listStaffAction; clicar de novo inverte a direção', async () => {
    listStaffAction.mockResolvedValue(RESULT)
    renderWithSession()
    await screen.findByText('Novo Staff')
    listStaffAction.mockClear()

    await userEvent.click(screen.getByText('Nome'))
    expect(listStaffAction).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDirection: 'asc', page: 1 })
    )

    await screen.findByText('Novo Staff')
    listStaffAction.mockClear()

    await userEvent.click(screen.getByText('Nome'))
    expect(listStaffAction).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDirection: 'desc', page: 1 })
    )
  })
})
