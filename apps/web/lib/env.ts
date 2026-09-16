/**
 * Leitura das variaveis de ambiente do frontend.
 *
 * O cuidado aqui nao e frescura: `??` so cai no padrao quando a variavel e
 * undefined. Na Vercel, uma variavel criada e deixada em branco chega como
 * string vazia — e foi exatamente isso que quebrou o build ("Invalid URL").
 * Vazio, so espacos ou valor invalido passam a valer como "nao definida".
 */
function lerUrl(valor: string | undefined, padrao: string, nome: string): string {
  const bruto = valor?.trim();

  if (!bruto) return padrao;

  try {
    new URL(bruto);
    return bruto.replace(/\/+$/, '');
  } catch {
    console.warn(`[env] ${nome} nao e uma URL valida ("${bruto}"); usando ${padrao}`);
    return padrao;
  }
}

export const API_URL = lerUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'http://localhost:3333/api/v1',
  'NEXT_PUBLIC_API_URL',
);

export const SITE_URL = lerUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'NEXT_PUBLIC_SITE_URL',
);

/** Host que serve as fotos dos estabelecimentos (`/uploads/*` no Caddy). */
export function padraoDeUploads() {
  try {
    const base = new URL(API_URL);

    return [
      {
        protocol: base.protocol.replace(':', '') as 'http' | 'https',
        hostname: base.hostname,
        port: base.port || undefined,
        pathname: '/uploads/**',
      },
    ];
  } catch {
    // Sem host valido nao ha foto remota para liberar; melhor um site sem
    // imagem externa do que um build quebrado.
    return [];
  }
}
