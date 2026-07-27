import { render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { AuditMovementItem } from '@/domain/dtos/audit.dto'
import { AuditDetailDialog } from './AuditDetailDialog'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const BASE_ITEM: AuditMovementItem = {
  id: 'wt-1',
  source: 'wallet_transaction',
  kind: 'deposit',
  direction: 'credit',
  amount: 200,
  status: 'concluido',
  gateway: 'Asaas (PIX)',
  userId: 42,
  userName: 'Fulano de Tal',
  telegramUserId: '5551234',
  referenceId: 'ref-1',
  responsibleAdmin: 'Admin Um',
  observations: 'Observação de teste',
  createdAt: '2026-07-20T10:00:00.000Z',
  updatedAt: '2026-07-21T11:30:00.000Z'
}

describe('AuditDetailDialog', () => {
  it('não renderiza nada quando item é null', () => {
    renderWithTheme(<AuditDetailDialog item={null} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('mostra todos os campos de uma movimentação de crédito completa', () => {
    renderWithTheme(<AuditDetailDialog item={BASE_ITEM} onClose={vi.fn()} />)

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('Movimentação wt-1')).toBeInTheDocument()
    expect(dialog.getByText('Asaas (PIX)')).toBeInTheDocument()
    expect(dialog.getByText(/\+R\$\s*200,00/)).toBeInTheDocument()
    expect(dialog.getByText('ref-1')).toBeInTheDocument()
    expect(dialog.getByText('#42 — Fulano de Tal')).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: '#42 — Fulano de Tal' })).toHaveAttribute('href', '/users/42')
    expect(dialog.getByText('5551234')).toBeInTheDocument()
    expect(dialog.getByText('Admin Um')).toBeInTheDocument()
    expect(dialog.getByText('Observação de teste')).toBeInTheDocument()
  })

  it('mostra o valor de débito com sinal negativo', () => {
    renderWithTheme(
      <AuditDetailDialog item={{ ...BASE_ITEM, kind: 'withdrawal', direction: 'debit' }} onClose={vi.fn()} />
    )

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/-R\$\s*200,00/)).toBeInTheDocument()
  })

  it('usa textos de reserva para campos opcionais ausentes', () => {
    renderWithTheme(
      <AuditDetailDialog
        item={{
          ...BASE_ITEM,
          telegramUserId: null,
          referenceId: null,
          responsibleAdmin: null,
          observations: null
        }}
        onClose={vi.fn()}
      />
    )

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('Sistema (automático)')).toBeInTheDocument()
    expect(dialog.getByText('Nenhuma observação registrada.')).toBeInTheDocument()
    expect(dialog.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })
})
