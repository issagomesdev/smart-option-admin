import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { RoleRowActions } from './RoleRowActions'

const deleteRoleAction = vi.fn()

vi.mock('./roles.actions', () => ({
  deleteRoleAction: (...args: unknown[]) => deleteRoleAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('RoleRowActions', () => {
  beforeEach(() => {
    deleteRoleAction.mockClear()
  })

  it('sempre mostra "Editar"', () => {
    renderWithTheme(<RoleRowActions roleId={7} roleName='moderador' isSystem={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Editar papel moderador' })).toBeInTheDocument()
  })

  it('mostra "Excluir" para um papel que não é de sistema', () => {
    renderWithTheme(<RoleRowActions roleId={7} roleName='moderador' isSystem={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Excluir papel moderador' })).toBeInTheDocument()
  })

  it('esconde "Excluir" para um papel de sistema (admin/staff) — o backend recusa incondicionalmente', () => {
    renderWithTheme(<RoleRowActions roleId={1} roleName='admin' isSystem onChanged={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Excluir papel admin' })).not.toBeInTheDocument()
  })

  it('"Excluir" abre o ConfirmDialog e só chama a action ao confirmar', async () => {
    const onChanged = vi.fn()
    deleteRoleAction.mockResolvedValue(undefined)
    renderWithTheme(<RoleRowActions roleId={7} roleName='moderador' isSystem={false} onChanged={onChanged} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir papel moderador' }))
    expect(screen.getByText('Excluir papel?')).toBeInTheDocument()
    expect(deleteRoleAction).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(deleteRoleAction).toHaveBeenCalledWith(7))
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })
})
