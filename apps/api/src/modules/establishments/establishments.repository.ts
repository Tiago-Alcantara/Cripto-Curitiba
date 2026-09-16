import type { Prisma, PrismaClient } from '@cripto/db';
import {
  categoriaParaBanco,
  type FiltrosResolvidos,
  metodoParaBanco,
  verificacaoParaBanco,
} from '@cripto/shared';
import type { EstablishmentComRelacoes } from './establishments.presenter.js';

/** O contrato de filtros e o do schema compartilhado, ja validado pela rota. */
export type FiltrosNormalizados = FiltrosResolvidos;

const incluiRelacoes = {
  acceptedPayments: {
    include: { crypto: true },
    orderBy: [{ crypto: { sortOrder: 'asc' } }, { method: 'asc' }],
  },
  photos: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
} satisfies Prisma.EstablishmentInclude;

function montarWhere(filtros: FiltrosNormalizados): Prisma.EstablishmentWhereInput {
  const where: Prisma.EstablishmentWhereInput = { status: 'PUBLISHED' };
  const and: Prisma.EstablishmentWhereInput[] = [];

  if (filtros.q) {
    and.push({
      OR: [
        { name: { contains: filtros.q, mode: 'insensitive' } },
        { description: { contains: filtros.q, mode: 'insensitive' } },
        { neighborhood: { contains: filtros.q, mode: 'insensitive' } },
      ],
    });
  }

  if (filtros.bairro?.length) {
    and.push({
      OR: filtros.bairro.map((b) => ({
        neighborhood: { equals: b, mode: 'insensitive' as const },
      })),
    });
  }

  if (filtros.categoria?.length) {
    const categorias = filtros.categoria
      .map((c) => categoriaParaBanco[c as keyof typeof categoriaParaBanco])
      .filter(Boolean);
    and.push({ category: { in: categorias as Prisma.EnumEstablishmentCategoryFilter['in'] } });
  }

  if (filtros.verificacao) {
    const status = verificacaoParaBanco[filtros.verificacao as keyof typeof verificacaoParaBanco];
    if (status) and.push({ verificationStatus: status });
  }

  // cripto e metodo precisam casar no MESMO pagamento: "aceita BTC" e "aceita
  // Lightning" juntos significam "aceita BTC via Lightning", nao dois pagamentos
  // diferentes que por acaso satisfazem cada metade.
  if (filtros.cripto?.length || filtros.metodo?.length) {
    const some: Prisma.AcceptedPaymentWhereInput = {};

    if (filtros.cripto?.length) {
      some.crypto = { symbol: { in: filtros.cripto.map((s) => s.toUpperCase()) } };
    }

    if (filtros.metodo?.length) {
      const metodos = filtros.metodo
        .map((m) => metodoParaBanco[m as keyof typeof metodoParaBanco])
        .filter(Boolean);
      some.method = { in: metodos as Prisma.EnumPaymentMethodFilter['in'] };
    }

    and.push({ acceptedPayments: { some } });
  }

  if (filtros.bbox) {
    const [minLng, minLat, maxLng, maxLat] = filtros.bbox.split(',').map(Number);
    and.push({
      latitude: {
        gte: Math.min(minLat as number, maxLat as number),
        lte: Math.max(minLat as number, maxLat as number),
      },
      longitude: {
        gte: Math.min(minLng as number, maxLng as number),
        lte: Math.max(minLng as number, maxLng as number),
      },
    });
  }

  if (and.length > 0) where.AND = and;

  return where;
}

function montarOrdenacao(
  ordenar: FiltrosNormalizados['ordenar'],
): Prisma.EstablishmentOrderByWithRelationInput[] {
  switch (ordenar) {
    case 'nome':
      return [{ name: 'asc' }];
    case 'verificados':
      return [{ verifiedAt: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
}

export function criarEstablishmentsRepository(prisma: PrismaClient) {
  return {
    async listar(filtros: FiltrosNormalizados) {
      const where = montarWhere(filtros);

      const [registros, total] = await Promise.all([
        prisma.establishment.findMany({
          where,
          include: incluiRelacoes,
          orderBy: montarOrdenacao(filtros.ordenar),
          skip: (filtros.page - 1) * filtros.perPage,
          take: filtros.perPage,
        }),
        prisma.establishment.count({ where }),
      ]);

      return { registros: registros as EstablishmentComRelacoes[], total };
    },

    async buscarPorSlug(slug: string) {
      const registro = await prisma.establishment.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: incluiRelacoes,
      });

      return registro as EstablishmentComRelacoes | null;
    },

    async listarSlugsPublicados() {
      return prisma.establishment.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      });
    },

    async listarBairros() {
      const grupos = await prisma.establishment.groupBy({
        by: ['neighborhood'],
        where: { status: 'PUBLISHED' },
        _count: { _all: true },
        orderBy: { neighborhood: 'asc' },
      });

      return grupos.map((grupo) => ({
        bairro: grupo.neighborhood,
        totalEstabelecimentos: grupo._count._all,
      }));
    },
  };
}

export type EstablishmentsRepository = ReturnType<typeof criarEstablishmentsRepository>;
