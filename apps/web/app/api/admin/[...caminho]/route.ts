import { type NextRequest, NextResponse } from 'next/server';
import { chamarApi } from '@/lib/admin-session';

type Contexto = { params: Promise<{ caminho: string[] }> };

/**
 * Proxy do painel: o browser fala com a origem da Vercel e o Next repassa o
 * token como Bearer. Nenhuma credencial trafega para o browser (ADR-0006).
 */
async function repassar(request: NextRequest, { params }: Contexto, metodo: string) {
  const { caminho } = await params;
  const query = request.nextUrl.search;
  const corpo = metodo === 'GET' ? undefined : await request.text();
  // "{}" vindo do browser e corpo valido; string vazia nao e.

  const resultado = await chamarApi<unknown>(`/admin/${caminho.join('/')}${query}`, {
    method: metodo,
    body: corpo && corpo.length > 0 ? corpo : undefined,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      { error: { code: 'REQUEST_FAILED', message: resultado.mensagem } },
      { status: resultado.status },
    );
  }

  return NextResponse.json(resultado.dados);
}

export const GET = (request: NextRequest, contexto: Contexto) => repassar(request, contexto, 'GET');
export const POST = (request: NextRequest, contexto: Contexto) =>
  repassar(request, contexto, 'POST');
export const PATCH = (request: NextRequest, contexto: Contexto) =>
  repassar(request, contexto, 'PATCH');
export const DELETE = (request: NextRequest, contexto: Contexto) =>
  repassar(request, contexto, 'DELETE');
