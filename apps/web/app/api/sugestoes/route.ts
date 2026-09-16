import { type NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

/**
 * O formulario posta para a propria origem e o Next repassa para a API. Isso
 * evita CORS e mantem o padrao do painel (browser fala so com a Vercel).
 *
 * O IP do visitante e repassado porque o rate limit por IP mora na API; sem
 * isso, todo envio chegaria com o IP da Vercel.
 */
export async function POST(request: NextRequest) {
  const corpo = await request.text();
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '';

  try {
    const resposta = await fetch(`${API_URL}/sugestoes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(ip ? { 'x-forwarded-for': ip } : {}),
      },
      body: corpo,
    });

    const dados = await resposta.json().catch(() => null);
    return NextResponse.json(dados, { status: resposta.status });
  } catch (erro) {
    console.error('[sugestoes] API indisponivel', erro);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Não foi possível enviar agora. Tente mais tarde.',
        },
      },
      { status: 502 },
    );
  }
}
