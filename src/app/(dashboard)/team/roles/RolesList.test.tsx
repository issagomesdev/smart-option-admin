import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { Role } from '@/domain/dtos/roles.dto'
import { RolesList } from './RolesList'

const listRolesAction = vi.fn()
const deleteRoleAction = vi.fn()

vi.mock('./roles.actions', () => ({
  listRolesAction: (...args: unknown[]) => listRolesAction(...args),
  deleteRoleAction: (...args: unknown[]) => deleteRoleAction(...args)
}))

function renderWithTheme() {
  return render(
    <ThemeProvider theme={theme}>
      <RolesList />
    </ThemeProvider>
  )
}

const ROLES: Role[] = [
  {
    id: 1,
    name: 'admin',
    description: 'Acesso total',
    permissions: ['users.write', 'roles.manage'],
    isSystem: true,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z'
  },
  {
    id: 8,
    name: 'moderador',
    description: null,
    permissions: ['support.write'],
    isSystem: false,
    createdAt: '2026-07-10T00:00:00.000Z',
    updatedAt: '2026-07-10T00:00:00.000Z'
  }
]

describe('RolesList', () => {
  it('lista nome, descrição e permissões (rotuladas em PT-BR) de cada papel', async () => {
    listRolesAction.mockResolvedValue(ROLES)
    renderWithTheme()

    expect(await screen.findByText('moderador')).toBeInTheDocument()
    expect(screen.getByText('Acesso total')).toBeInTheDocument()
    expect(screen.getByText('Marcar solicitações de suporte como concluídas')).toBeInTheDocument()
  })

  it('mostra "Excluir" só para o papel que não é de sistema', async () => {
    listRolesAction.mockResolvedValue(ROLES)
    renderWithTheme()

    await screen.findByText('moderador')

    expect(screen.queryByRole('button', { name: 'Excluir papel admin' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir papel moderador' })).toBeInTheDocument()
  })

  it('mostra o botão "Novo papel" apontando para /team/roles/create', async () => {
    listRolesAction.mockResolvedValue(ROLES)
    renderWithTheme()

    await screen.findByText('moderador')
    expect(screen.getByRole('link', { name: /Novo papel/ })).toHaveAttribute('href', '/team/roles/create')
  })

  /**
   * `GET /api/roles` nunca aceitou `sortBy`/`sortDirection` (nunca paginou) —
   * a ordenação clicando no cabeçalho precisa reordenar as linhas já
   * carregadas em memória, sem repetir a chamada a `listRolesAction`.
   */
  it('ordena os papéis em memória ao clicar no cabeçalho "Nome", sem chamar listRolesAction de novo', async () => {
    listRolesAction.mockResolvedValue(ROLES)
    renderWithTheme()
    await screen.findByText('moderador')
    listRolesAction.mockClear()

    await userEvent.click(screen.getByText('Nome'))
    await userEvent.click(screen.getByText('Nome'))

    const adminCell = screen.getByText('admin')
    const moderadorCell = screen.getByText('moderador')
    expect(moderadorCell.compareDocumentPosition(adminCell) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(listRolesAction).not.toHaveBeenCalled()
  })
})
