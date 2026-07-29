import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { TeamRowActions } from './TeamRowActions'

const deleteStaffAction = vi.fn()

vi.mock('./team.actions', () => ({
  deleteStaffAction: (...args: unknown[]) => deleteStaffAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('TeamRowActions', () => {
  beforeEach(() => {
    deleteStaffAction.mockClear()
  })

  it('sempre mostra "Editar"', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isSelf={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Editar Fulano' })).toBeInTheDocument()
  })

  it('mostra "Excluir" para qualquer colaborador que não seja o próprio staff logado', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isSelf={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Excluir Fulano' })).toBeInTheDocument()
  })

  it('mostra "Excluir" mesmo para um colaborador já inativo — é justamente o caso de limpar a lista', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isSelf={false} onChanged={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Excluir Fulano' })).toBeInTheDocument()
  })

  it('esconde "Excluir" quando é o próprio staff logado (evita um 403 garantido)', () => {
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isSelf onChanged={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Excluir Fulano' })).not.toBeInTheDocument()
  })

  it('esconde "Excluir" para o administrador principal (id 1), mesmo com outro staff logado', () => {
    renderWithTheme(<TeamRowActions staffId={1} staffName='sr admin' isSelf={false} onChanged={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Excluir sr admin' })).not.toBeInTheDocument()
    // A edição continua disponível — só a exclusão é bloqueada.
    expect(screen.getByRole('link', { name: 'Editar sr admin' })).toBeInTheDocument()
  })

  it('"Excluir" abre o ConfirmDialog e só chama a action ao confirmar', async () => {
    const onChanged = vi.fn()
    deleteStaffAction.mockResolvedValue(undefined)
    renderWithTheme(<TeamRowActions staffId={7} staffName='Fulano' isSelf={false} onChanged={onChanged} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Fulano' }))
    expect(screen.getByText('Excluir colaborador?')).toBeInTheDocument()
    expect(deleteStaffAction).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(deleteStaffAction).toHaveBeenCalledWith(7))
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })
})
