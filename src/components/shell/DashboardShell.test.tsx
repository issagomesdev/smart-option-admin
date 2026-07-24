import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/theme/theme'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import { DashboardShell } from './DashboardShell'
import { useSession } from './SessionContext'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() })
}))

vi.mock('@mui/material/useMediaQuery', () => ({
  default: () => true
}))

const BASE_USER: SessionUser = {
  id: 1,
  name: 'Admin',
  surname: 'Teste',
  email: 'admin@test.local',
  roleId: 1,
  permissions: []
}

function ConsumerProbe() {
  const user = useSession()
  return <div>sessão: {user.email}</div>
}

function renderShell(permissions: string[], children: React.ReactNode = <div>conteúdo</div>) {
  return render(
    <ThemeProvider theme={theme}>
      <DashboardShell user={{ ...BASE_USER, permissions }}>{children}</DashboardShell>
    </ThemeProvider>
  )
}

describe('DashboardShell', () => {
  it('mostra os 3 itens de leitura aberta para qualquer staff autenticado, mesmo sem nenhuma permissão', () => {
    renderShell([])

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitações' })).toBeInTheDocument()
  })

  it('esconde "Equipe" sem staff.manage e mostra com staff.manage — primeiro item de verdade a usar o filtro por permissão', () => {
    renderShell([])
    expect(screen.queryByRole('link', { name: 'Equipe' })).not.toBeInTheDocument()

    renderShell(['staff.manage'])
    expect(screen.getByRole('link', { name: 'Equipe' })).toBeInTheDocument()
  })

  it('disponibiliza a sessão (incluindo permissions) via contexto para componentes filhos', () => {
    renderShell(['users.write'], <ConsumerProbe />)

    expect(screen.getByText('sessão: admin@test.local')).toBeInTheDocument()
  })
})
