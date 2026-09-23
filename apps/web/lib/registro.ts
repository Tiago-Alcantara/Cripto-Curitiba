import type { EstabelecimentoResumo, Pagamento } from '@cripto/shared';
import { rotulos } from '@cripto/shared';

/**
 * Derivados de apresentacao do "registro" (docs/05-design.md): numero de
 * ficha, rotulo de cripto e rotulo de categoria.
 */

/**
 * Numero de ficha (№ 001) pela ordem de entrada no registro. A lista vem da
 * API em `recentes` (mais novo primeiro), entao o numero e `total - indice`:
 * um local novo nao renumera os antigos.
 */
export function numerarFichas(
  lista: Pick<EstabelecimentoResumo, 'id'>[],
  total: number,
): Map<string, string> {
  return new Map(lista.map((item, indice) => [item.id, String(total - indice).padStart(3, '0')]));
}

/** `BTC · Lightning`, `USDT · Polygon`: a rede, quando existe, diz mais que o metodo. */
export function rotuloCripto(pagamento: Pagamento): string {
  const metodo = rotulos.metodo[pagamento.metodo as keyof typeof rotulos.metodo];
  return `${pagamento.cripto} · ${pagamento.rede ?? metodo}`;
}

export function rotulosCripto(pagamentos: Pagamento[]): string[] {
  return [...new Set(pagamentos.map(rotuloCripto))];
}

export function rotuloCategoria(categoria: string): string {
  return rotulos.categoria[categoria as keyof typeof rotulos.categoria] ?? categoria;
}

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
