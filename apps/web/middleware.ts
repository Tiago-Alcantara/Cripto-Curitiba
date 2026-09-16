import { type NextRequest, NextResponse } from 'next/server';

const COOKIE_ADMIN = process.env.ADMIN_COOKIE_NAME ?? 'cc_admin';

/**
 * Barreira rasa: so confere a presenca do cookie para evitar mostrar o painel
 * a quem nao esta logado. A validacao de verdade e do token, e acontece na API
 * a cada requisicao.
 */
export function middleware(request: NextRequest) {
  const temCookie = Boolean(request.cookies.get(COOKIE_ADMIN)?.value);
  const ehLogin = request.nextUrl.pathname === '/admin/login';

  if (!temCookie && !ehLogin) {
    const destino = new URL('/admin/login', request.url);
    destino.searchParams.set('de', request.nextUrl.pathname);
    return NextResponse.redirect(destino);
  }

  if (temCookie && ehLogin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
