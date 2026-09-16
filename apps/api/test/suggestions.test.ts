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
let estabelecimentoId: string;

const enviar = (corpo: unknown) =>
  app.inject({ method: 'POST', url: '/api/v1/sugestoes', payload: corpo });

beforeAll(async () => {
  prisma = criarPrismaDeTeste();
  app = await criarAppDeTeste();
});

beforeEach(async () => {
  await limparBanco(prisma);
  estabelecimentoId = await criarEstabelecimento(prisma, { slug: 'lugar-existente' });
});

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
});

describe('POST /api/v1/sugestoes', () => {
  it('aceita sugestao de novo local e guarda como pendente', async () => {
    const resposta = await enviar({
      tipo: 'novo_local',
      dados: { nome: 'Cafe Novo', bairro: 'Batel', criptos: ['BTC'], metodos: ['lightning'] },
      mensagem: 'Paguei com Lightning ontem',
      remetente: { nome: 'Fulano', email: 'fulano@exemplo.com' },
    });

    expect(resposta.statusCode).toBe(201);
    expect(JSON.parse(resposta.payload).status).toBe('pendente');

    const sugestao = await prisma.suggestion.findFirst();
    expect(sugestao).toMatchObject({ type: 'NEW_PLACE', status: 'PENDING' });
    expect(sugestao?.payload).toMatchObject({ nome: 'Cafe Novo' });
  });

  it('guarda o hash do IP, nunca o IP', async () => {
    await enviar({ tipo: 'novo_local', dados: { nome: 'Outro Cafe' } });

    const sugestao = await prisma.suggestion.findFirst();
    expect(sugestao?.ipHash).toBeTruthy();
    expect(sugestao?.ipHash).not.toContain('127.0.0.1');
    expect(sugestao?.ipHash).toHaveLength(32);
  });

  it('recusa novo local sem nome', async () => {
    const resposta = await enviar({ tipo: 'novo_local', dados: { bairro: 'Centro' } });

    expect(resposta.statusCode).toBe(400);
    expect(JSON.parse(resposta.payload).error.code).toBe('VALIDATION_ERROR');
  });

  it('exige estabelecimento em reporte de erro', async () => {
    const resposta = await enviar({ tipo: 'reporte_erro', mensagem: 'nao aceita mais' });

    expect(resposta.statusCode).toBe(400);
  });

  it('recusa estabelecimento inexistente', async () => {
    const resposta = await enviar({
      tipo: 'atualizacao',
      estabelecimentoId: 'nao-existe',
      mensagem: 'mudou de endereco',
    });

    expect(resposta.statusCode).toBe(400);
    expect(await prisma.suggestion.count()).toBe(0);
  });

  it('vincula a sugestao ao estabelecimento informado', async () => {
    const resposta = await enviar({
      tipo: 'reporte_erro',
      estabelecimentoId,
      mensagem: 'horario mudou',
    });

    expect(resposta.statusCode).toBe(201);
    const sugestao = await prisma.suggestion.findFirst();
    expect(sugestao?.establishmentId).toBe(estabelecimentoId);
  });

  it('descarta envio que preenche o honeypot', async () => {
    const resposta = await enviar({
      tipo: 'novo_local',
      dados: { nome: 'Spam Bot' },
      website: 'http://spam.example',
    });

    expect(resposta.statusCode).toBe(400);
    expect(await prisma.suggestion.count()).toBe(0);
  });

  it('nao publica nada: sugestao nao vira estabelecimento sozinha', async () => {
    await enviar({ tipo: 'novo_local', dados: { nome: 'Cafe Novo' } });

    const lista = await app.inject({ url: '/api/v1/estabelecimentos' });
    const slugs = (JSON.parse(lista.payload).data as { slug: string }[]).map((e) => e.slug);

    expect(slugs).toEqual(['lugar-existente']);
  });
});
