import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import { SessionProvider, useHasPermission, useSession } from './SessionContext'

const BASE_USER: SessionUser = {
  id: 1,
  name: 'Admin',
  surname: 'Teste',
  email: 'admin@test.local',
  roleId: 1,
  permissions: ['users.write']
}

function SessionProbe() {
  const user = useSession()
  return <div>{user.email}</div>
}

function PermissionProbe({ permission }: { permission: 'users.write' | 'roles.manage' }) {
  const allowed = useHasPermission(permission)
  return <div>{allowed ? 'permitido' : 'negado'}</div>
}

describe('useSession', () => {
  it('devolve o usuário quando usado dentro de SessionProvider', () => {
    render(
      <SessionProvider user={BASE_USER}>
        <SessionProbe />
      </SessionProvider>
    )

    expect(screen.getByText('admin@test.local')).toBeInTheDocument()
  })

  it('lança um erro quando usado fora de um SessionProvider', () => {
    // Suprime o log de erro esperado do React (boundary não usada de propósito neste teste unitário).
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<SessionProbe />)).toThrow('useSession precisa ser usado dentro de um SessionProvider')

    consoleError.mockRestore()
  })
})

describe('useHasPermission', () => {
  it('devolve true para uma permissão presente e false para uma ausente', () => {
    render(
      <SessionProvider user={BASE_USER}>
        <PermissionProbe permission='users.write' />
        <PermissionProbe permission='roles.manage' />
      </SessionProvider>
    )

    expect(screen.getByText('permitido')).toBeInTheDocument()
    expect(screen.getByText('negado')).toBeInTheDocument()
  })
})
