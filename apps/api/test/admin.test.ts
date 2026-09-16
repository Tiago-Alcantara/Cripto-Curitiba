import type { PrismaClient } from '@cripto/db';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  criarAppDeTeste,
  criarEstabelecimento,
  criarPrismaDeTeste,
  limparBanco,
} from './helpers.js';

let app: FastifyInstance;
let prisma: PrismaClient;
let token: string;

const SENHA = 'senha-de-teste-123';

async function criarAdmin() {
  const { hash } = await import('@node-rs/argon2');

  await prisma.adminUser.create({
    data: {
      email: 'admin@teste.local',
      name: 'Admin Teste',
      passwordHash: await hash(SENHA),
      role: 'OWNER',
    },
  });
}

async function autenticar() {
  const resposta = await app.inject({
    method: 'POST',
    url: '/api/v1/admin/auth/login',
    payload: { email: 'admin@teste.local', senha: SENHA },
  });

  return JSON.parse(resposta.payload).token as string;
}

const comToken = (opcoes: Parameters<FastifyInstance['inject']>[0] & object) =>
  app.inject({ ...opcoes, headers: { authorization: `Bearer ${token}` } });

beforeAll(async () => {
  prisma = criarPrismaDeTeste();
  app = await criarAppDeTeste();
});

beforeEach(async () => {
  await limparBanco(prisma);
  await criarAdmin();
  token = await autenticar();
});

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
});

describe('autenticacao', () => {
  it('recusa senha errada', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/auth/login',
      payload: { email: 'admin@teste.local', senha: 'errada' },
    });

    expect(resposta.statusCode).toBe(401);
    expect(JSON.parse(resposta.payload).error.code).toBe('UNAUTHORIZED');
  });

  it('nao revela se o e-mail existe', async () => {
    const inexistente = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/auth/login',
      payload: { email: 'ninguem@teste.local', senha: 'errada' },
    });

    expect(inexistente.statusCode).toBe(401);
    expect(JSON.parse(inexistente.payload).error.message).toBe('E-mail ou senha invalidos');
  });

  it('devolve o usuario autenticado', async () => {
    const resposta = await comToken({ method: 'GET', url: '/api/v1/admin/auth/me' });

    expect(resposta.statusCode).toBe(200);
    expect(JSON.parse(resposta.payload)).toMatchObject({
      email: 'admin@teste.local',
      papel: 'OWNER',
    });
  });

  it('bloqueia rota de admin sem token', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/api/v1/admin/estabelecimentos' });

    expect(resposta.statusCode).toBe(401);
  });
});

describe('CRUD de estabelecimentos', () => {
  it('cria como rascunho, gera slug e nao publica sozinho', async () => {
    const resposta = await comToken({
      method: 'POST',
      url: '/api/v1/admin/estabelecimentos',
      payload: {
        nome: 'Tartuferia São Paulo',
        categoria: 'restaurante',
        bairro: 'Batel',
        pagamentos: [{ cripto: 'btc', metodo: 'lightning', custodia: 'carteira-propria' }],
      },
    });

    expect(resposta.statusCode).toBe(201);
    const criado = JSON.parse(resposta.payload);

    expect(criado.slug).toBe('tartuferia-sao-paulo');
    expect(criado.status).toBe('rascunho');
    expect(criado.verificacao.status).toBe('nao-verificado');
    expect(criado.pagamentos).toHaveLength(1);
    expect(criado.pagamentos[0]).toMatchObject({ cripto: 'BTC', metodo: 'lightning' });

    const publico = await app.inject({ url: '/api/v1/estabelecimentos' });
    expect(JSON.parse(publico.payload).data).toHaveLength(0);
  });

  it('gera slug alternativo quando ja existe', async () => {
    await criarEstabelecimento(prisma, { slug: 'cafe-do-largo', nome: 'Cafe do Largo' });

    const resposta = await comToken({
      method: 'POST',
      url: '/api/v1/admin/estabelecimentos',
      payload: { nome: 'Cafe do Largo', categoria: 'cafe', bairro: 'Centro' },
    });

    expect(JSON.parse(resposta.payload).slug).toBe('cafe-do-largo-2');
  });

  it('recusa slug duplicado informado a mao', async () => {
    await criarEstabelecimento(prisma, { slug: 'ja-existe' });

    const resposta = await comToken({
      method: 'POST',
      url: '/api/v1/admin/estabelecimentos',
      payload: { nome: 'Outro', slug: 'ja-existe', categoria: 'bar', bairro: 'Centro' },
    });

    expect(resposta.statusCode).toBe(409);
  });

  it('recusa pagamentos duplicados', async () => {
    const resposta = await comToken({
      method: 'POST',
      url: '/api/v1/admin/estabelecimentos',
      payload: {
        nome: 'Duplicado',
        categoria: 'bar',
        bairro: 'Centro',
        pagamentos: [
          { cripto: 'BTC', metodo: 'lightning' },
          { cripto: 'btc', metodo: 'lightning' },
        ],
      },
    });

    expect(resposta.statusCode).toBe(400);
  });

  it('publica e o registro aparece no site', async () => {
    const criado = JSON.parse(
      (
        await comToken({
          method: 'POST',
          url: '/api/v1/admin/estabelecimentos',
          payload: { nome: 'Bar Novo', categoria: 'bar', bairro: 'Centro' },
        })
      ).payload,
    );

    const publicado = await comToken({
      method: 'POST',
      url: `/api/v1/admin/estabelecimentos/${criado.id}/publicar`,
    });

    expect(publicado.statusCode).toBe(200);
    expect(JSON.parse(publicado.payload).status).toBe('publicado');

    const publico = await app.inject({ url: '/api/v1/estabelecimentos' });
    expect(JSON.parse(publico.payload).data).toHaveLength(1);
  });

  it('arquivar tira do site sem apagar o registro', async () => {
    const id = await criarEstabelecimento(prisma, { slug: 'vai-arquivar' });

    await comToken({ method: 'POST', url: `/api/v1/admin/estabelecimentos/${id}/arquivar` });

    const publico = await app.inject({ url: '/api/v1/estabelecimentos' });
    expect(JSON.parse(publico.payload).data).toHaveLength(0);
    expect(await prisma.establishment.findUnique({ where: { id } })).not.toBeNull();
  });

  it('verificar grava data, autor e confirma os pagamentos', async () => {
    const id = await criarEstabelecimento(prisma, {
      slug: 'a-verificar',
      pagamentos: [{ simbolo: 'BTC', metodo: 'LIGHTNING' }],
    });

    const resposta = await comToken({
      method: 'POST',
      url: `/api/v1/admin/estabelecimentos/${id}/verificar`,
      payload: { status: 'verificado', nota: 'confirmado por telefone' },
    });

    const corpo = JSON.parse(resposta.payload);
    expect(corpo.verificacao.status).toBe('verificado');
    expect(corpo.verificacao.em).toBeTruthy();
    expect(corpo.verificacao.por).toBe('Admin Teste');
    expect(corpo.pagamentos[0].confirmadoEm).toBeTruthy();
  });

  it('edita substituindo os pagamentos', async () => {
    const id = await criarEstabelecimento(prisma, {
      slug: 'edita-pagamentos',
      pagamentos: [{ simbolo: 'BTC', metodo: 'LIGHTNING' }],
    });

    const resposta = await comToken({
      method: 'PATCH',
      url: `/api/v1/admin/estabelecimentos/${id}`,
      payload: { pagamentos: [{ cripto: 'USDT', metodo: 'tron' }] },
    });

    const corpo = JSON.parse(resposta.payload);
    expect(corpo.pagamentos).toHaveLength(1);
    expect(corpo.pagamentos[0]).toMatchObject({ cripto: 'USDT', metodo: 'tron' });
  });
});

describe('moderacao de sugestoes', () => {
  async function enviarSugestao(payload: object) {
    const resposta = await app.inject({
      method: 'POST',
      url: '/api/v1/sugestoes',
      payload,
    });

    return JSON.parse(resposta.payload).id as string;
  }

  it('aprovar sugestao de novo local cria RASCUNHO, nunca publicado', async () => {
    const id = await enviarSugestao({
      tipo: 'novo_local',
      dados: {
        nome: 'Cafe da Comunidade',
        bairro: 'Juveve',
        criptos: ['BTC'],
        metodos: ['lightning'],
      },
    });

    const resposta = await comToken({
      method: 'POST',
      url: `/api/v1/admin/sugestoes/${id}/aprovar`,
      payload: { nota: 'parece legitimo' },
    });

    expect(resposta.statusCode).toBe(200);

    const criado = await prisma.establishment.findFirst({ where: { name: 'Cafe da Comunidade' } });
    expect(criado?.status).toBe('DRAFT');
    expect(criado?.verificationStatus).toBe('COMMUNITY_REPORTED');

    const publico = await app.inject({ url: '/api/v1/estabelecimentos' });
    expect(JSON.parse(publico.payload).data).toHaveLength(0);
  });

  it('nao modera duas vezes a mesma sugestao', async () => {
    const id = await enviarSugestao({ tipo: 'novo_local', dados: { nome: 'Cafe Unico' } });

    await comToken({ method: 'POST', url: `/api/v1/admin/sugestoes/${id}/aprovar`, payload: {} });
    const segunda = await comToken({
      method: 'POST',
      url: `/api/v1/admin/sugestoes/${id}/aprovar`,
      payload: {},
    });

    expect(segunda.statusCode).toBe(409);
  });

  it('rejeita marcando como spam', async () => {
    const id = await enviarSugestao({ tipo: 'novo_local', dados: { nome: 'Spam Ltda' } });

    const resposta = await comToken({
      method: 'POST',
      url: `/api/v1/admin/sugestoes/${id}/rejeitar`,
      payload: { spam: true, nota: 'propaganda' },
    });

    expect(JSON.parse(resposta.payload).status).toBe('spam');
    expect(await prisma.establishment.count()).toBe(0);
  });

  it('lista a fila de pendentes', async () => {
    await enviarSugestao({ tipo: 'novo_local', dados: { nome: 'Pendente Um' } });
    await enviarSugestao({ tipo: 'novo_local', dados: { nome: 'Pendente Dois' } });

    const resposta = await comToken({ method: 'GET', url: '/api/v1/admin/sugestoes' });
    const corpo = JSON.parse(resposta.payload);

    expect(corpo.data).toHaveLength(2);
    expect(corpo.data[0].status).toBe('pendente');
    expect(corpo.data[0].tipo).toBe('novo_local');
  });
});

describe('trilha de auditoria', () => {
  it('registra quem fez cada acao', async () => {
    const criado = JSON.parse(
      (
        await comToken({
          method: 'POST',
          url: '/api/v1/admin/estabelecimentos',
          payload: { nome: 'Auditado', categoria: 'bar', bairro: 'Centro' },
        })
      ).payload,
    );

    await comToken({ method: 'POST', url: `/api/v1/admin/estabelecimentos/${criado.id}/publicar` });

    const registros = await prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } });
    expect(registros.map((r) => r.action)).toEqual([
      'establishment.create',
      'establishment.publish',
    ]);
    expect(registros[0]?.actorId).toBeTruthy();
  });
});
