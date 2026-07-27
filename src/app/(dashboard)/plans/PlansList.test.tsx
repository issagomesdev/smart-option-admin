import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { PaginatedPlans, Plan } from '@/domain/dtos/plans.dto'
import { PlansList } from './PlansList'

const listPlansAction = vi.fn()
const deletePlanAction = vi.fn()
vi.mock('./plans.actions', () => ({
  listPlansAction: (...args: unknown[]) => listPlansAction(...args),
  deletePlanAction: (...args: unknown[]) => deletePlanAction(...args)
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const SYSTEM_PLAN: Plan = {
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

const CUSTOM_PLAN: Plan = {
  id: 10,
  name: 'Plano Personalizado',
  description: 'Criado pelo painel.',
  price: 49.9,
  earningsMonthly: 2.5,
  purchaseType: 'manual',
  isSystem: false,
  isActive: false,
  subscriberCount: 0
}

const RESULT: PaginatedPlans = {
  data: [SYSTEM_PLAN, CUSTOM_PLAN],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
}

describe('PlansList', () => {
  beforeEach(() => {
    listPlansAction.mockClear()
    deletePlanAction.mockClear()
    listPlansAction.mockResolvedValue(RESULT)
  })

  it('lista os planos com valor, rentabilidade e tipo formatados', async () => {
    renderWithTheme(<PlansList />)

    expect(await screen.findByText('diamond')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*297,00/)).toBeInTheDocument()
    expect(screen.getByText('8,00%')).toBeInTheDocument()
    expect(screen.getByText('Automático (PIX)')).toBeInTheDocument()
    expect(screen.getByText('Manual (via suporte)')).toBeInTheDocument()
  })

  it('marca visualmente os planos do sistema e a situação de cada um', async () => {
    renderWithTheme(<PlansList />)

    await screen.findByText('diamond')
    expect(screen.getByText('Plano do sistema')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  // As duas regras de `PlansService.delete`, refletidas na UI: plano de sistema e plano com
  // assinantes não podem ser excluídos. Editar continua disponível para ambos.
  it('não oferece excluir para plano do sistema nem para plano com assinantes', async () => {
    renderWithTheme(<PlansList />)
    await screen.findByText('diamond')

    expect(screen.queryByRole('button', { name: 'Excluir plano diamond' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar plano diamond' })).toBeInTheDocument()
  })

  it('oferece excluir para plano próprio sem assinantes', async () => {
    renderWithTheme(<PlansList />)
    await screen.findByText('Plano Personalizado')

    expect(screen.getByRole('button', { name: 'Excluir plano Plano Personalizado' })).toBeInTheDocument()
  })

  it('trocar o filtro de tipo repassa purchaseType e volta para a página 1', async () => {
    renderWithTheme(<PlansList />)
    await screen.findByText('diamond')
    listPlansAction.mockClear()

    await userEvent.click(screen.getByLabelText('Tipo'))
    await userEvent.click(await screen.findByRole('option', { name: 'Manual (via suporte)' }))

    await waitFor(() =>
      expect(listPlansAction).toHaveBeenCalledWith(expect.objectContaining({ purchaseType: 'manual', page: 1 }))
    )
  })

  it('filtro de situação envia isActive=false (e não some por ser falsy)', async () => {
    renderWithTheme(<PlansList />)
    await screen.findByText('diamond')
    listPlansAction.mockClear()

    await userEvent.click(screen.getByLabelText('Situação'))
    await userEvent.click(await screen.findByRole('option', { name: 'Inativos' }))

    await waitFor(() => expect(listPlansAction).toHaveBeenCalledWith(expect.objectContaining({ isActive: false })))
  })

  it('ordenar por Valor repassa sortBy/sortDirection', async () => {
    renderWithTheme(<PlansList />)
    await screen.findByText('diamond')
    listPlansAction.mockClear()

    await userEvent.click(within(screen.getByRole('columnheader', { name: 'Valor' })).getByText('Valor'))

    await waitFor(() =>
      expect(listPlansAction).toHaveBeenCalledWith(expect.objectContaining({ sortBy: 'price', sortDirection: 'asc' }))
    )
  })
})
