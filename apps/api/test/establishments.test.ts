import type { PrismaClient } from '@cripto/db';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  criarAppDeTeste,
  criarEstabelecimento,
  criarPrismaDeTeste,
  limparBanco,
} from './helpers.js';

let app: FastifyInstance;
let prisma: PrismaClient;

const slugs = (payload: string) =>
  (JSON.parse(payload).data as { slug: string }[]).map((e) => e.slug);

beforeAll(async () => {
  prisma = criarPrismaDeTeste();
  await limparBanco(prisma);

  await criarEstabelecimento(prisma, {
    slug: 'cafe-lightning',
    nome: 'Cafe Lightning',
    bairro: 'Centro',
    categoria: 'CAFE',
    verificacao: 'VERIFIED',
    latitude: -25.43,
    longitude: -49.27,
    pagamentos: [{ simbolo: 'BTC', metodo: 'LIGHTNING' }],
  });

  await criarEstabelecimento(prisma, {
    slug: 'bistro-onchain',
    nome: 'Bistro Onchain',
    bairro: 'Batel',
    categoria: 'RESTAURANT',
    latitude: -25.44,
    longitude: -49.29,
    pagamentos: [{ simbolo: 'BTC', metodo: 'ONCHAIN' }],
  });

  await criarEstabelecimento(prisma, {
    slug: 'mercado-usdt',
    nome: 'Mercado USDT',
    bairro: 'Portao',
    categoria: 'MARKET',
    pagamentos: [{ simbolo: 'USDT', metodo: 'TRON' }],
  });

  await criarEstabelecimento(prisma, {
    slug: 'rascunho-invisivel',
    status: 'DRAFT',
    pagamentos: [{ simbolo: 'BTC', metodo: 'LIGHTNING' }],
  });

  await criarEstabelecimento(prisma, { slug: 'arquivado-invisivel', status: 'ARCHIVED' });

  app = await criarAppDeTeste();
});

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
});

describe('GET /api/v1/estabelecimentos', () => {
  it('lista apenas publicados', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/api/v1/estabelecimentos' });

    expect(resposta.statusCode).toBe(200);
    expect(slugs(resposta.payload).sort()).toEqual([
      'bistro-onchain',
      'cafe-lightning',
      'mercado-usdt',
    ]);
    expect(JSON.parse(resposta.payload).meta.total).toBe(3);
  });

  it('filtra por cripto', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?cripto=USDT' });

    expect(slugs(resposta.payload)).toEqual(['mercado-usdt']);
  });

  it('exige que cripto e metodo casem no mesmo pagamento', async () => {
    // BTC existe nos dois primeiros, mas so o bistro aceita BTC on-chain.
    const resposta = await app.inject({
      url: '/api/v1/estabelecimentos?cripto=BTC&metodo=onchain',
    });

    expect(slugs(resposta.payload)).toEqual(['bistro-onchain']);
  });

  it('aceita lista separada por virgula', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?categoria=cafe,mercado' });

    expect(slugs(resposta.payload).sort()).toEqual(['cafe-lightning', 'mercado-usdt']);
  });

  it('filtra por bairro ignorando caixa', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?bairro=batel' });

    expect(slugs(resposta.payload)).toEqual(['bistro-onchain']);
  });

  it('filtra por verificacao', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?verificacao=verificado' });

    expect(slugs(resposta.payload)).toEqual(['cafe-lightning']);
  });

  it('busca textual em nome e bairro', async () => {
    const porNome = await app.inject({ url: '/api/v1/estabelecimentos?q=bistro' });
    const porBairro = await app.inject({ url: '/api/v1/estabelecimentos?q=portao' });

    expect(slugs(porNome.payload)).toEqual(['bistro-onchain']);
    expect(slugs(porBairro.payload)).toEqual(['mercado-usdt']);
  });

  it('filtra por bbox e ignora quem nao tem coordenada', async () => {
    const resposta = await app.inject({
      url: '/api/v1/estabelecimentos?bbox=-49.28,-25.44,-49.26,-25.42',
    });

    expect(slugs(resposta.payload)).toEqual(['cafe-lightning']);
  });

  it('pagina o resultado', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?perPage=2&page=2' });
    const corpo = JSON.parse(resposta.payload);

    expect(corpo.data).toHaveLength(1);
    expect(corpo.meta).toMatchObject({ page: 2, perPage: 2, total: 3, totalPages: 2 });
  });

  it('ordena por nome', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?ordenar=nome' });

    expect(slugs(resposta.payload)).toEqual(['bistro-onchain', 'cafe-lightning', 'mercado-usdt']);
  });

  it('rejeita perPage acima do limite', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos?perPage=500' });

    expect(resposta.statusCode).toBe(400);
    expect(JSON.parse(resposta.payload).error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/v1/estabelecimentos/:slug', () => {
  it('retorna o registro completo traduzido', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos/cafe-lightning' });
    const corpo = JSON.parse(resposta.payload);

    expect(resposta.statusCode).toBe(200);
    expect(corpo.nome).toBe('Cafe Lightning');
    expect(corpo.categoria).toBe('cafe');
    expect(corpo.verificacao.status).toBe('verificado');
    expect(corpo.endereco.cidade).toBe('Curitiba');
    expect(corpo.pagamentos[0]).toMatchObject({ cripto: 'BTC', metodo: 'lightning' });
  });

  it('nao expoe rascunho', async () => {
    const resposta = await app.inject({ url: '/api/v1/estabelecimentos/rascunho-invisivel' });

    expect(resposta.statusCode).toBe(404);
    expect(JSON.parse(resposta.payload).error.code).toBe('NOT_FOUND');
  });
});

describe('facetas', () => {
  it('lista bairros publicados com contagem', async () => {
    const resposta = await app.inject({ url: '/api/v1/bairros' });

    expect(JSON.parse(resposta.payload)).toEqual([
      { bairro: 'Batel', totalEstabelecimentos: 1 },
      { bairro: 'Centro', totalEstabelecimentos: 1 },
      { bairro: 'Portao', totalEstabelecimentos: 1 },
    ]);
  });

  it('conta estabelecimentos por cripto sem contar rascunho', async () => {
    const resposta = await app.inject({ url: '/api/v1/criptomoedas' });
    const porSimbolo = Object.fromEntries(
      (JSON.parse(resposta.payload) as { symbol: string; totalEstabelecimentos: number }[]).map(
        (c) => [c.symbol, c.totalEstabelecimentos],
      ),
    );

    expect(porSimbolo.BTC).toBe(2);
    expect(porSimbolo.USDT).toBe(1);
  });
});
