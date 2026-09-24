import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

/** Comparacao em tempo constante: o tempo de resposta nao pode vazar quanto do segredo bateu. */
function segredosIguais(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Webhook chamado pela API quando um estabelecimento e publicado, editado ou
 * arquivado (ADR-0007). Sem ele, o conteudo novo so apareceria no proximo
 * ciclo de revalidacao por tempo.
 */
export async function POST(request: NextRequest) {
  const segredo = process.env.REVALIDATE_SECRET;
  const recebido = request.headers.get('x-revalidate-secret');

  if (!segredo || !recebido || !segredosIguais(recebido, segredo)) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Segredo inválido' } },
      { status: 401 },
    );
  }

  const corpo = (await request.json().catch(() => null)) as { tags?: string[] } | null;
  const tags = corpo?.tags ?? [];

  if (tags.length === 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Informe ao menos uma tag' } },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    // Next 16 exige o perfil de cache: 'max' expira a entrada imediatamente
    // para o proximo acesso, que e o comportamento esperado ao publicar.
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({ revalidadas: tags });
}
