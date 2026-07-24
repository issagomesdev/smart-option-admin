import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/infrastructure/http/cookies'

const PUBLIC_PATHS = ['/login']

/**
 * Checagem barata (só existência de cookie, sem chamar o backend) — verificar
 * o JWT de verdade a cada requisição custaria uma chamada de rede extra por
 * navegação. Quem descobre que o access token expirou de verdade é o
 * primeiro fetch autenticado que a página fizer (recebe 401, tenta
 * `/api/auth/refresh`, e só then redireciona se o refresh também falhar).
 */
export function middleware(request: NextRequest) {
  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE)
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE)

  if (!hasAccessToken && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Matcher final: `/account-settings` era a última rota ainda no Pages
// Router/`AuthContext` antigo — com ela migrada (Fase 4 parte 4), toda rota
// autenticada do painel já vive em `src/app/**` sobre o mesmo BFF, então o
// matcher passa a cobrir qualquer caminho, exceto os explicitamente públicos
// (rotas de API do próprio Next, assets estáticos, favicon, imagens e o
// `/login`).
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|login).*)']
}
