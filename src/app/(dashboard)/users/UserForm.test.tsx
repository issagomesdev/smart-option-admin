import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { BotUserDetail } from '@/domain/dtos/users.dto'
import { UserForm } from './UserForm'

const push = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh })
}))

const createBotUserAction = vi.fn()
const updateBotUserAction = vi.fn()

vi.mock('./users.actions', () => ({
  createBotUserAction: (...args: unknown[]) => createBotUserAction(...args),
  updateBotUserAction: (...args: unknown[]) => updateBotUserAction(...args)
}))

vi.mock('../dashboard.actions', () => ({
  getPlansAction: () => Promise.resolve([{ id: 1, name: 'plan-a' }])
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

async function fillCommonFields() {
  await userEvent.type(screen.getByLabelText('Nome'), 'Fulano de Tal')
  await userEvent.type(screen.getByLabelText('E-mail'), 'fulano@example.com')
  await userEvent.type(screen.getByLabelText('Telefone'), '11999999999')
  await userEvent.type(screen.getByLabelText('Endereço'), 'Rua Um, 123')
  await userEvent.type(screen.getByLabelText('Chave Pix'), 'fulano@example.com')
}

describe('UserForm', () => {
  beforeEach(() => {
    push.mockClear()
    refresh.mockClear()
    createBotUserAction.mockClear()
    updateBotUserAction.mockClear()
  })

  it('modo create: mostra erros de validação e não chama a action com campos obrigatórios vazios', async () => {
    renderWithTheme(<UserForm mode='create' />)

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findAllByText('Campo obrigatório')).not.toHaveLength(0)
    expect(createBotUserAction).not.toHaveBeenCalled()
  })

  it('modo create: bloqueia envio sem senha mesmo com os demais campos válidos', async () => {
    renderWithTheme(<UserForm mode='create' />)

    await fillCommonFields()
    await userEvent.type(screen.getByLabelText('CPF'), '12345678900')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(createBotUserAction).not.toHaveBeenCalled())
  })

  it('modo create: envia todos os campos e redireciona para /users em caso de sucesso', async () => {
    createBotUserAction.mockResolvedValue(undefined)
    renderWithTheme(<UserForm mode='create' />)

    await fillCommonFields()
    await userEvent.type(screen.getByLabelText('CPF'), '12345678900')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(createBotUserAction).toHaveBeenCalledTimes(1))
    expect(createBotUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fulano de Tal',
        email: 'fulano@example.com',
        password: 'senha123',
        cpf: '12345678900',
        phone_number: '11999999999',
        adress: 'Rua Um, 123',
        pix_code: 'fulano@example.com'
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/users'))
  })

  it('modo edit: pré-preenche os campos com initialValues e envia update sem senha quando deixada em branco', async () => {
    const initialValues: BotUserDetail = {
      id: 42,
      productId: null,
      name: 'Ciclana',
      email: 'ciclana@example.com',
      phoneNumber: '11888888888',
      adress: 'Av. Dois, 456',
      pixCode: 'ciclana-pix',
      isActive: true,
      plan: 'without',
      telegram: 'off',
      created_at: '2026-01-01',
      status: 1
    }
    updateBotUserAction.mockResolvedValue(undefined)

    renderWithTheme(<UserForm mode='edit' userId={42} initialValues={initialValues} />)

    expect(screen.getByLabelText('Nome')).toHaveValue('Ciclana')
    expect(screen.getByLabelText('E-mail')).toHaveValue('ciclana@example.com')

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(updateBotUserAction).toHaveBeenCalledTimes(1))
    expect(updateBotUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 42,
        name: 'Ciclana',
        email: 'ciclana@example.com',
        password: undefined
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/users'))
  })
})
