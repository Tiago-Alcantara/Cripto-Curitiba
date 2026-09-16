import { createPrismaClient, type PrismaClient } from '@cripto/db';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://cripto:cripto@localhost:5432/criptocuritiba_test?schema=public';

export async function criarAppDeTeste(): Promise<FastifyInstance> {
  const app = await buildApp({
    NODE_ENV: 'test',
    DATABASE_URL: TEST_DATABASE_URL,
    LOG_LEVEL: 'fatal',
    JWT_SECRET: 'segredo-de-teste-com-mais-de-32-caracteres!!',
  });

  await app.ready();
  return app;
}

export function criarPrismaDeTeste(): PrismaClient {
  return createPrismaClient(TEST_DATABASE_URL);
}

export async function limparBanco(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "AcceptedPayment", "EstablishmentPhoto", "Suggestion", "Establishment", "Crypto", "AuditLog", "AdminUser" RESTART IDENTITY CASCADE',
  );
}

type PagamentoFixture = {
  simbolo: string;
  metodo: 'LIGHTNING' | 'ONCHAIN' | 'EVM' | 'TRON' | 'SOLANA' | 'LIQUID' | 'OTHER';
};

type EstabelecimentoFixture = {
  slug: string;
  nome?: string;
  bairro?: string;
  categoria?:
    | 'RESTAURANT'
    | 'CAFE'
    | 'BAR'
    | 'BAKERY'
    | 'FAST_FOOD'
    | 'MARKET'
    | 'STORE'
    | 'SERVICE'
    | 'OTHER';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  verificacao?: 'VERIFIED' | 'COMMUNITY_REPORTED' | 'UNVERIFIED';
  latitude?: number;
  longitude?: number;
  pagamentos?: PagamentoFixture[];
};

export async function criarEstabelecimento(
  prisma: PrismaClient,
  fixture: EstabelecimentoFixture,
): Promise<string> {
  const estabelecimento = await prisma.establishment.create({
    data: {
      slug: fixture.slug,
      name: fixture.nome ?? fixture.slug,
      neighborhood: fixture.bairro ?? 'Centro',
      category: fixture.categoria ?? 'RESTAURANT',
      status: fixture.status ?? 'PUBLISHED',
      verificationStatus: fixture.verificacao ?? 'COMMUNITY_REPORTED',
      verifiedAt: fixture.verificacao === 'VERIFIED' ? new Date() : null,
      latitude: fixture.latitude ?? null,
      longitude: fixture.longitude ?? null,
    },
  });

  for (const pagamento of fixture.pagamentos ?? []) {
    const crypto = await prisma.crypto.upsert({
      where: { symbol: pagamento.simbolo },
      create: { symbol: pagamento.simbolo, name: pagamento.simbolo },
      update: {},
    });

    await prisma.acceptedPayment.create({
      data: {
        establishmentId: estabelecimento.id,
        cryptoId: crypto.id,
        method: pagamento.metodo,
      },
    });
  }

  return estabelecimento.id;
}
