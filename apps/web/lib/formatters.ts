import type { Estabelecimento, Horarios, Pagamento } from '@cripto/shared';
import { rotulos } from '@cripto/shared';

const MESES_ATE_DESATUALIZADO = 12;

/** Formato do selo do registro: `fev/2026`. */
export function formatarMesAno(iso: string | null): string | null {
  if (!iso) return null;

  const partes = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(new Date(iso));

  const mes = partes.find((p) => p.type === 'month')?.value.replace('.', '');
  const ano = partes.find((p) => p.type === 'year')?.value;

  return mes && ano ? `${mes}/${ano}` : null;
}

/** Um dado confirmado ha mais de um ano vira pedido de ajuda, nao afirmacao. */
export function estaDesatualizado(iso: string | null): boolean {
  if (!iso) return false;

  const limite = new Date();
  limite.setMonth(limite.getMonth() - MESES_ATE_DESATUALIZADO);

  return new Date(iso) < limite;
}

export function confirmacaoMaisRecente(pagamentos: Pagamento[]): string | null {
  const datas = pagamentos.map((p) => p.confirmadoEm).filter((d): d is string => Boolean(d));

  if (datas.length === 0) return null;

  return datas.reduce((maior, atual) => (atual > maior ? atual : maior));
}

export function descreverPagamento(pagamento: Pagamento): string {
  const metodo = rotulos.metodo[pagamento.metodo as keyof typeof rotulos.metodo];
  return pagamento.rede ? `${metodo} · ${pagamento.rede}` : metodo;
}

export function faixaPreco(valor: number | null): { texto: string; descricao: string } | null {
  if (!valor || valor < 1) return null;

  const nivel = Math.min(Math.round(valor), 4);
  return { texto: '$'.repeat(nivel), descricao: `Faixa de preço ${nivel} de 4` };
}

export function enderecoEmLinha(endereco: Estabelecimento['endereco']): string {
  const rua = [endereco.rua, endereco.numero].filter(Boolean).join(', ');
  return [rua, endereco.bairro, endereco.cidade].filter(Boolean).join(' · ');
}

const DIAS: { chave: keyof Horarios; nome: string }[] = [
  { chave: 'mon', nome: 'Segunda' },
  { chave: 'tue', nome: 'Terça' },
  { chave: 'wed', nome: 'Quarta' },
  { chave: 'thu', nome: 'Quinta' },
  { chave: 'fri', nome: 'Sexta' },
  { chave: 'sat', nome: 'Sábado' },
  { chave: 'sun', nome: 'Domingo' },
];

export type HorarioDia = { nome: string; texto: string };

/**
 * [] = fechado; ausente/null = sem informacao. A distincao importa: "nao
 * sabemos" nunca pode aparecer como "fechado".
 */
export function listarHorarios(horarios: Horarios | null): HorarioDia[] {
  if (!horarios) return [];

  return DIAS.map(({ chave, nome }) => {
    const faixas = horarios[chave];

    if (faixas === undefined || faixas === null) return { nome, texto: 'Sem informação' };
    if (faixas.length === 0) return { nome, texto: 'Fechado' };

    return { nome, texto: faixas.map((f) => `${f.open} às ${f.close}`).join(', ') };
  });
}

export function urlComoChegar(estabelecimento: Estabelecimento): string {
  if (estabelecimento.contato.googleMaps) return estabelecimento.contato.googleMaps;

  const destino =
    estabelecimento.latitude && estabelecimento.longitude
      ? `${estabelecimento.latitude},${estabelecimento.longitude}`
      : `${estabelecimento.nome}, ${enderecoEmLinha(estabelecimento.endereco)}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
}
