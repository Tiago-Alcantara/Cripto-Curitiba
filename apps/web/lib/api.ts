import type { Bairro, Cripto, Estabelecimento, ListaEstabelecimentos } from '@cripto/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1';

/** Tags de cache do ISR. A API invalida por elas ao publicar (ADR-0007). */
export const TAG_ESTABELECIMENTOS = 'estabelecimentos';
export const tagEstabelecimento = (slug: string) => `estabelecimento:${slug}`;

type BuscarOpcoes = {
  tags?: string[];
  revalidate?: number | false;
};

async function buscar<T>(caminho: string, opcoes: BuscarOpcoes = {}): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    next: {
      tags: opcoes.tags ?? [TAG_ESTABELECIMENTOS],
      revalidate: opcoes.revalidate ?? 3600,
    },
  });

  if (!resposta.ok) {
    throw new ApiError(resposta.status, `Falha ao buscar ${caminho}`);
  }

  return (await resposta.json()) as T;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ParametrosBusca = Record<string, string | string[] | undefined>;

function montarQuery(parametros: ParametrosBusca = {}): string {
  const query = new URLSearchParams();

  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor === undefined) continue;
    for (const item of Array.isArray(valor) ? valor : [valor]) {
      if (item) query.append(chave, item);
    }
  }

  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

export function listarEstabelecimentos(parametros?: ParametrosBusca) {
  return buscar<ListaEstabelecimentos>(`/estabelecimentos${montarQuery(parametros)}`);
}

export async function buscarEstabelecimento(slug: string): Promise<Estabelecimento | null> {
  try {
    return await buscar<Estabelecimento>(`/estabelecimentos/${slug}`, {
      tags: [TAG_ESTABELECIMENTOS, tagEstabelecimento(slug)],
    });
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) return null;
    throw erro;
  }
}

export function listarBairros() {
  return buscar<Bairro[]>('/bairros');
}

export function listarCriptomoedas() {
  return buscar<Cripto[]>('/criptomoedas');
}

export function listarPublicados() {
  return buscar<{ slug: string; atualizadoEm: string }[]>('/estabelecimentos-publicados');
}

/**
 * Build da Vercel nao pode quebrar porque a VPS piscou: nas rotinas de build
 * (generateStaticParams, sitemap) uma falha vira lista vazia e as paginas sao
 * geradas sob demanda no primeiro acesso. Em renderizacao de pagina o erro
 * continua subindo - ali mentir seria pior.
 */
export async function tolerante<T>(promessa: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promessa;
  } catch (erro) {
    console.warn('[api] falha tolerada durante o build:', erro);
    return fallback;
  }
}
