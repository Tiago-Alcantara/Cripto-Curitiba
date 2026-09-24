import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { API_URL } from './env';

export const COOKIE_ADMIN = process.env.ADMIN_COOKIE_NAME ?? 'cc_admin';
export { API_URL } from './env';

/**
 * Repassa o IP do visitante para a API junto de um segredo compartilhado
 * (`PROXY_TRUST_SECRET`, o mesmo dos dois lados) para que ela distinga uma
 * chamada legitima do BFF de alguem forjando `X-Forwarded-For` direto na API.
 * Sem o segredo configurado, nao envia nada: a API cai no IP da propria
 * conexao.
 */
export function headersDeIpConfiavel(request: NextRequest): Record<string, string> {
  const segredo = process.env.PROXY_TRUST_SECRET;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  if (!segredo || !ip) return {};

  return { 'x-forwarded-client-ip': ip, 'x-proxy-trust-secret': segredo };
}

/**
 * O token do painel vive em cookie httpOnly na origem da Vercel e nunca chega
 * ao JavaScript da pagina (ADR-0006). Todo acesso a API passa por aqui.
 */
export async function lerToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_ADMIN)?.value ?? null;
}

export function opcoesCookie(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export type RespostaApi<T> =
  | { ok: true; dados: T }
  | { ok: false; status: number; mensagem: string };

/** Chamada autenticada a API, feita sempre do servidor. */
export async function chamarApi<T>(
  caminho: string,
  init: RequestInit = {},
): Promise<RespostaApi<T>> {
  const token = await lerToken();

  if (!token) {
    return { ok: false, status: 401, mensagem: 'Sessão expirada' };
  }

  try {
    // content-type so quando ha corpo: o Fastify recusa POST com
    // "application/json" e corpo vazio, e acoes como publicar nao tem corpo.
    const temCorpo = init.body !== undefined && init.body !== null && init.body !== '';

    const resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      body: temCorpo ? init.body : undefined,
      headers: {
        ...init.headers,
        ...(temCorpo ? { 'content-type': 'application/json' } : {}),
        authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      const erro = corpo as { error?: { message?: string } } | null;
      return {
        ok: false,
        status: resposta.status,
        mensagem: erro?.error?.message ?? 'Falha na operação',
      };
    }

    return { ok: true, dados: corpo as T };
  } catch {
    return { ok: false, status: 502, mensagem: 'API indisponível' };
  }
}
