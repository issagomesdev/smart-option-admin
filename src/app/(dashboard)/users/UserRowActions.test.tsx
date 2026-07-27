import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { SessionProvider } from '@/components/shell/SessionContext'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import { UserRowActions } from './UserRowActions'

const deleteBotUserAction = vi.fn()

vi.mock('./users.actions', () => ({
  deleteBotUserAction: (...args: unknown[]) => deleteBotUserAction(...args)
}))

const BASE_USER: SessionUser = {
  id: 1,
  name: 'Admin',
  surname: 'Teste',
  email: 'admin@test.local',
  roleId: 1,
  permissions: [],
  isDemo: false
}

function renderWithTheme(ui: React.ReactElement, permissions: string[] = ['users.write', 'finance.adjust']) {
  return render(
    <ThemeProvider theme={theme}>
      <SessionProvider user={{ ...BASE_USER, permissions }}>{ui}</SessionProvider>
    </ThemeProvider>
  )
}

describe('UserRowActions', () => {
  beforeEach(() => {
    deleteBotUserAction.mockClear()
  })

  it('com users.write e finance.adjust, mostra as 4 ações esperadas', async () => {
    renderWithTheme(<UserRowActions userId={7} userName='Fulano' onDeleted={vi.fn()} onTransfer={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ações de Fulano' }))

    expect(screen.getByRole('menuitem', { name: /Visualizar/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Editar/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Ajustar saldo/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Excluir/ })).toBeInTheDocument()
  })

  it('"Ajustar saldo" chama onTransfer com o id do usuário', async () => {
    const onTransfer = vi.fn()
    renderWithTheme(<UserRowActions userId={7} userName='Fulano' onDeleted={vi.fn()} onTransfer={onTransfer} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ações de Fulano' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Ajustar saldo/ }))

    expect(onTransfer).toHaveBeenCalledWith(7)
  })

  it('"Excluir" abre o ConfirmDialog e só chama deleteBotUserAction ao confirmar', async () => {
    const onDeleted = vi.fn()
    deleteBotUserAction.mockResolvedValue(undefined)
    renderWithTheme(<UserRowActions userId={7} userName='Fulano' onDeleted={onDeleted} onTransfer={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ações de Fulano' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Excluir/ }))

    expect(screen.getByText('Excluir usuário?')).toBeInTheDocument()
    expect(deleteBotUserAction).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(deleteBotUserAction).toHaveBeenCalledWith(7))
    await waitFor(() => expect(onDeleted).toHaveBeenCalled())
  })

  it('sem nenhuma permissão de escrita, só "Visualizar" aparece no menu', async () => {
    renderWithTheme(<UserRowActions userId={7} userName='Fulano' onDeleted={vi.fn()} onTransfer={vi.fn()} />, [])

    await userEvent.click(screen.getByRole('button', { name: 'Ações de Fulano' }))

    expect(screen.getByRole('menuitem', { name: /Visualizar/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Ajustar saldo/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Excluir/ })).not.toBeInTheDocument()
  })

  it('com só finance.adjust (sem users.write), mostra "Ajustar saldo" mas não "Editar"/"Excluir"', async () => {
    renderWithTheme(<UserRowActions userId={7} userName='Fulano' onDeleted={vi.fn()} onTransfer={vi.fn()} />, [
      'finance.adjust'
    ])

    await userEvent.click(screen.getByRole('button', { name: 'Ações de Fulano' }))

    expect(screen.getByRole('menuitem', { name: /Ajustar saldo/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Excluir/ })).not.toBeInTheDocument()
  })
})
