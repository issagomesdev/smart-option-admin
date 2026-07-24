import { redirect } from 'next/navigation'

/**
 * Redireciona a URL antiga (`/users/view/:id`, Pages Router) para a nova
 * (`/users/:id`) — as 6 telas de Solicitações (ainda não migradas, próxima
 * parte desta fase) linkam para o formato antigo em vários lugares
 * (`layouts/components/pages/requests/*.tsx`). Em vez de editar 6 arquivos
 * que serão reescritos em breve de qualquer forma, este redirect preserva
 * os links existentes até que essas telas migrem e passem a linkar direto
 * para `/users/:id`.
 */
export default async function LegacyViewUserRedirect({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params
  redirect(`/users/${view}`)
}
