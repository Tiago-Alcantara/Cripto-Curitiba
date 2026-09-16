import { z } from 'zod';

/**
 * Enums do dominio em duas formas: o valor do banco (ingles, maiusculo) e o
 * valor publico (portugues, minusculo) usado em URLs e no JSON da API.
 * A traducao acontece so aqui e nos presenters (ADR-0008).
 */

export const categorias = {
  RESTAURANT: 'restaurante',
  CAFE: 'cafe',
  BAR: 'bar',
  BAKERY: 'padaria',
  FAST_FOOD: 'lanchonete',
  MARKET: 'mercado',
  STORE: 'loja',
  SERVICE: 'servico',
  OTHER: 'outro',
} as const;

export const metodosPagamento = {
  LIGHTNING: 'lightning',
  ONCHAIN: 'onchain',
  LIQUID: 'liquid',
  EVM: 'evm',
  TRON: 'tron',
  SOLANA: 'solana',
  OTHER: 'outro',
} as const;

export const custodias = {
  OWN_WALLET: 'carteira-propria',
  PROCESSOR: 'processador',
  EXCHANGE: 'exchange',
  UNKNOWN: 'nao-informado',
} as const;

export const verificacoes = {
  VERIFIED: 'verificado',
  COMMUNITY_REPORTED: 'comunidade',
  UNVERIFIED: 'nao-verificado',
} as const;

function invert<T extends Record<string, string>>(map: T) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as {
    [K in keyof T as T[K]]: K;
  };
}

export const categoriaParaBanco = invert(categorias);
export const metodoParaBanco = invert(metodosPagamento);
export const custodiaParaBanco = invert(custodias);
export const verificacaoParaBanco = invert(verificacoes);

export type Categoria = (typeof categorias)[keyof typeof categorias];
export type MetodoPagamento = (typeof metodosPagamento)[keyof typeof metodosPagamento];
export type Custodia = (typeof custodias)[keyof typeof custodias];
export type Verificacao = (typeof verificacoes)[keyof typeof verificacoes];

// O cast preserva a uniao literal: sem ele o schema inferiria `string` e o
// frontend perderia a checagem de tipo nos valores publicos.
export const categoriaSchema = z.enum(Object.values(categorias) as [Categoria, ...Categoria[]]);
export const metodoSchema = z.enum(
  Object.values(metodosPagamento) as [MetodoPagamento, ...MetodoPagamento[]],
);
export const custodiaSchema = z.enum(Object.values(custodias) as [Custodia, ...Custodia[]]);
export const verificacaoSchema = z.enum(
  Object.values(verificacoes) as [Verificacao, ...Verificacao[]],
);

export const rotulos = {
  categoria: {
    restaurante: 'Restaurante',
    cafe: 'Café',
    bar: 'Bar',
    padaria: 'Padaria',
    lanchonete: 'Lanchonete',
    mercado: 'Mercado',
    loja: 'Loja',
    servico: 'Serviço',
    outro: 'Outro',
  },
  metodo: {
    lightning: 'Lightning',
    onchain: 'On-chain',
    liquid: 'Liquid',
    evm: 'Rede EVM',
    tron: 'Tron',
    solana: 'Solana',
    outro: 'Outro',
  },
  custodia: {
    'carteira-propria': 'Carteira própria',
    processador: 'Processador',
    exchange: 'Exchange',
    'nao-informado': 'Não informado',
  },
  verificacao: {
    verificado: 'Verificado',
    comunidade: 'Reportado pela comunidade',
    'nao-verificado': 'Não verificado',
  },
} as const satisfies Record<string, Record<string, string>>;
