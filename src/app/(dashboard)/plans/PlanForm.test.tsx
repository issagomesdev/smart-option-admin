import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { Plan } from '@/domain/dtos/plans.dto'
import { PlanForm } from './PlanForm'

const createPlanAction = vi.fn()
const updatePlanAction = vi.fn()
vi.mock('./plans.actions', () => ({
  createPlanAction: (...args: unknown[]) => createPlanAction(...args),
  updatePlanAction: (...args: unknown[]) => updatePlanAction(...args)
}))

const push = vi.fn()
const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const EXISTING_PLAN: Plan = {
  id: 4,
  name: 'diamond',
  description: 'Plano semeado.',
  price: 297,
  earningsMonthly: 8,
  purchaseType: 'auto',
  isSystem: true,
  isActive: true,
  subscriberCount: 12
}

describe('PlanForm', () => {
  beforeEach(() => {
    createPlanAction.mockClear()
    updatePlanAction.mockClear()
    push.mockClear()
    refresh.mockClear()
  })

  it('modo create: envia os campos convertidos para número', async () => {
    createPlanAction.mockResolvedValue({ id: 11 })
    renderWithTheme(<PlanForm mode='create' />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Plano Novo')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição do plano.')
    const price = screen.getByLabelText('Valor')
    await userEvent.clear(price)
    await userEvent.type(price, '149.9')
    const earnings = screen.getByLabelText('Rentabilidade mensal')
    await userEvent.clear(earnings)
    await userEvent.type(earnings, '5')

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() =>
      expect(createPlanAction).toHaveBeenCalledWith({
        name: 'Plano Novo',
        description: 'Descrição do plano.',
        price: 149.9,
        earningsMonthly: 5,
        purchaseType: 'auto',
        isActive: true
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/plans'))
  })

  it('bloqueia envio com nome vazio, sem chamar a action', async () => {
    renderWithTheme(<PlanForm mode='create' />)

    await userEvent.type(screen.getByLabelText('Descrição'), 'só descrição')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Campo obrigatório')).toBeInTheDocument()
    expect(createPlanAction).not.toHaveBeenCalled()
  })

  it('rejeita rentabilidade acima do limite da coluna (999,99%)', async () => {
    renderWithTheme(<PlanForm mode='create' />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Plano X')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Desc')
    const earnings = screen.getByLabelText('Rentabilidade mensal')
    await userEvent.clear(earnings)
    await userEvent.type(earnings, '1500')

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Máximo 999,99%')).toBeInTheDocument()
    expect(createPlanAction).not.toHaveBeenCalled()
  })

  it('modo edit: pré-preenche e avisa sobre o impacto nos assinantes e sobre ser plano do sistema', async () => {
    renderWithTheme(<PlanForm mode='edit' planId={4} initialValues={EXISTING_PLAN} />)

    expect(screen.getByLabelText('Nome')).toHaveValue('diamond')
    expect(screen.getByText(/plano do sistema/i)).toBeInTheDocument()
    expect(screen.getByText(/12 usuário\(s\) já possuem este plano/)).toBeInTheDocument()
    expect(screen.getByText(/rendimento diário creditado a todos eles/)).toBeInTheDocument()
  })

  it('modo edit: salva as alterações pelo id', async () => {
    updatePlanAction.mockResolvedValue(EXISTING_PLAN)
    renderWithTheme(<PlanForm mode='edit' planId={4} initialValues={EXISTING_PLAN} />)

    const name = screen.getByLabelText('Nome')
    await userEvent.clear(name)
    await userEvent.type(name, 'diamond plus')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() =>
      expect(updatePlanAction).toHaveBeenCalledWith(4, expect.objectContaining({ name: 'diamond plus', price: 297 }))
    )
  })

  it('explica o comportamento do tipo MANUAL ao selecioná-lo', async () => {
    renderWithTheme(<PlanForm mode='create' />)

    await userEvent.click(screen.getByLabelText('Tipo'))
    await userEvent.click(await screen.findByRole('option', { name: 'Manual (via suporte)' }))

    expect(await screen.findByText(/abre uma solicitação de atendimento/i)).toBeInTheDocument()
  })
})
