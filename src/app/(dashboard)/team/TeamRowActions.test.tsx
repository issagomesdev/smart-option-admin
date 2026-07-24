import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { TeamRowActions } from './TeamRowActions'

const deactivateStaffAction = vi.fn()

vi.mock('./team.actions', () => ({
  deactivateStaffAction: (...args: unknown[]) => deactivateStaffAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('TeamRowActions', () => {
  beforeEach(() => {
    deactivateStaffAction.mockClear()
  })

  it('sempre mostra "Editar papel"', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isActive isSelf={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Editar papel de Fulano' })).toBeInTheDocument()
  })

  it('mostra "Desativar" quando ativo e não é o próprio staff logado', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isActive isSelf={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Desativar Fulano' })).toBeInTheDocument()
  })

  it('esconde "Desativar" quando é o próprio staff logado (evita um 403 garantido)', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isActive isSelf onChanged={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Desativar Fulano' })).not.toBeInTheDocument()
  })

  it('esconde "Desativar" quando o staff já está inativo', () => {
    renderWithTheme(
      <TeamRowActions staffId={7} staffName='Fulano' isActive={false} isSelf={false} onChanged={vi.fn()} />
    )

    expect(screen.queryByRole('button', { name: 'Desativar Fulano' })).not.toBeInTheDocument()
  })

  it('"Desativar" abre o ConfirmDialog e só chama a action ao confirmar', async () => {
    const onChanged = vi.fn()
    deactivateStaffAction.mockResolvedValue(undefined)
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isActive isSelf={false} onChanged={onChanged} />)

    await userEvent.click(screen.getByRole('button', { name: 'Desativar Fulano' }))
    expect(screen.getByText('Desativar staff?')).toBeInTheDocument()
    expect(deactivateStaffAction).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Desativar' }))

    await waitFor(() => expect(deactivateStaffAction).toHaveBeenCalledWith(7))
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })
})
