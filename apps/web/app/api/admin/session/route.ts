import { type NextRequest, NextResponse } from 'next/server';
import { API_URL, COOKIE_ADMIN, headersDeIpConfiavel, opcoesCookie } from '@/lib/admin-session';

const SETE_DIAS = 60 * 60 * 24 * 7;

/** Login: troca e-mail e senha por um token, guardado em cookie httpOnly. */
export async function POST(request: NextRequest) {
  const credenciais = await request.json().catch(() => null);

  const resposta = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headersDeIpConfiavel(request),
    },
    body: JSON.stringify(credenciais),
  }).catch(() => null);

  if (!resposta) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'API indisponível' } },
      { status: 502 },
    );
  }

  const corpo = (await resposta.json().catch(() => null)) as {
    token?: string;
    usuario?: unknown;
    error?: { message?: string };
  } | null;

  if (!resposta.ok || !corpo?.token) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: corpo?.error?.message ?? 'Não foi possível entrar',
        },
      },
      { status: resposta.status },
    );
  }

  const resultado = NextResponse.json({ usuario: corpo.usuario });
  resultado.cookies.set(COOKIE_ADMIN, corpo.token, opcoesCookie(SETE_DIAS));

  return resultado;
}

/** Logout: apaga o cookie. O token expira sozinho do lado da API. */
export async function DELETE() {
  const resultado = NextResponse.json({ ok: true });
  resultado.cookies.set(COOKIE_ADMIN, '', opcoesCookie(0));

  return resultado;
}
