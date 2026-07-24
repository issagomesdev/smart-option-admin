import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import { LoginForm } from './LoginForm'

const replace = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => new URLSearchParams()
}))

function renderWithTheme() {
  return render(
    <ThemeProvider theme={theme}>
      <LoginForm />
    </ThemeProvider>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    replace.mockClear()
    refresh.mockClear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mostra erros de validação e não chama a API com campos vazios', async () => {
    renderWithTheme()

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia para /api/auth/login e redireciona para / em caso de sucesso', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: { user: { id: 1, name: 'sr', surname: 'admin', email: 'admin@admin.com', roleId: 1 } }
        })
    } as Response)

    renderWithTheme()

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@admin.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
    expect(refresh).toHaveBeenCalled()

    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(JSON.parse(options?.body as string)).toEqual({
      email: 'admin@admin.com',
      password: 'password',
      remember: false
    })
  })

  it('mostra o erro do backend inline e não redireciona em caso de credencial inválida', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({ success: false, error: { code: 'UNAUTHORIZED', message: 'Email e/ou senha inválidos' } })
    } as Response)

    renderWithTheme()

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@admin.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-errada')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email e/ou senha inválidos')
    expect(replace).not.toHaveBeenCalled()
  })

  it('checkbox "Manter conectado" envia remember=true', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: { user: { id: 1, name: 'sr', surname: 'admin', email: 'admin@admin.com', roleId: 1 } }
        })
    } as Response)

    renderWithTheme()

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@admin.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'password')
    await userEvent.click(screen.getByLabelText('Manter conectado'))
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect(JSON.parse(options?.body as string)).toMatchObject({ remember: true })
  })
})
