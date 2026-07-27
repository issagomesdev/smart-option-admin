'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import type { Permission } from '@/domain/permissions'

const SessionContext = createContext<SessionUser | null>(null)

/** Único ponto de entrada da sessão no lado do client — montado uma vez em `DashboardShell`, em volta de todo o conteúdo autenticado. */
export function SessionProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
}

/**
 * Só deve ser chamado por componentes sob `(dashboard)/**` — o layout desse
 * grupo já redireciona para `/login` antes de renderizar qualquer coisa sem
 * sessão, então chegar aqui sem `SessionProvider` no ancestral é sempre um
 * erro de composição do componente, não um estado real de usuário.
 */
export function useSession(): SessionUser {
  const user = useContext(SessionContext)
  if (!user) throw new Error('useSession precisa ser usado dentro de um SessionProvider (DashboardShell).')
  return user
}

/** Checagem client-side é só UX (esconder/desabilitar ação) — a garantia real de autorização é sempre o backend (`requirePermission`). */
export function useHasPermission(permission: Permission): boolean {
  const { permissions } = useSession()
  return permissions.includes(permission)
}

/**
 * Sessão rodando no ambiente de demonstração. Como `useHasPermission`, serve só para UX — desabilitar
 * o controle e explicar o porquê, em vez de deixar o visitante clicar e tomar um 403 seco. A recusa
 * de verdade continua sendo do backend (`denyInDemo`), e as duas listas precisam combinar.
 *
 * Diferente de `useSession`, NÃO lança sem provider: `DemoGuard` envolve botões em formulários que
 * são renderizados isoladamente (testes de componente, `/design-system`), e exigir uma sessão só
 * para saber se o modo demo está ligado acoplaria esses componentes ao shell inteiro. Sem sessão a
 * resposta é `false` — o padrão seguro, que é também o comportamento de produção.
 */
export function useIsDemo(): boolean {
  return useContext(SessionContext)?.isDemo ?? false
}
