import type { Prisma, PrismaClient } from '@cripto/db';

const incluiRelacoes = {
  acceptedPayments: { include: { crypto: true } },
  photos: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
} satisfies Prisma.EstablishmentInclude;

export function criarAdminRepository(prisma: PrismaClient) {
  return {
    async listar(filtros: {
      q?: string;
      status?: Prisma.EstablishmentWhereInput['status'];
      verificacao?: Prisma.EstablishmentWhereInput['verificationStatus'];
      page: number;
      perPage: number;
    }) {
      const where: Prisma.EstablishmentWhereInput = {};

      if (filtros.q) {
        where.OR = [
          { name: { contains: filtros.q, mode: 'insensitive' } },
          { neighborhood: { contains: filtros.q, mode: 'insensitive' } },
          { slug: { contains: filtros.q, mode: 'insensitive' } },
        ];
      }
      if (filtros.status) where.status = filtros.status;
      if (filtros.verificacao) where.verificationStatus = filtros.verificacao;

      const [registros, total] = await Promise.all([
        prisma.establishment.findMany({
          where,
          include: incluiRelacoes,
          orderBy: [{ updatedAt: 'desc' }],
          skip: (filtros.page - 1) * filtros.perPage,
          take: filtros.perPage,
        }),
        prisma.establishment.count({ where }),
      ]);

      return { registros, total };
    },

    porId(id: string) {
      return prisma.establishment.findUnique({ where: { id }, include: incluiRelacoes });
    },

    slugExiste(slug: string) {
      return prisma.establishment
        .findUnique({ where: { slug }, select: { id: true } })
        .then((registro) => registro !== null);
    },

    criar(dados: Prisma.EstablishmentUncheckedCreateInput) {
      return prisma.establishment.create({ data: dados, include: incluiRelacoes });
    },

    atualizar(id: string, dados: Prisma.EstablishmentUncheckedUpdateInput) {
      return prisma.establishment.update({ where: { id }, data: dados, include: incluiRelacoes });
    },

    /** Substitui o conjunto de pagamentos em uma transacao. */
    async substituirPagamentos(
      establishmentId: string,
      pagamentos: Omit<Prisma.AcceptedPaymentUncheckedCreateInput, 'establishmentId'>[],
    ) {
      await prisma.$transaction([
        prisma.acceptedPayment.deleteMany({ where: { establishmentId } }),
        ...(pagamentos.length > 0
          ? [
              prisma.acceptedPayment.createMany({
                data: pagamentos.map((pagamento) => ({ ...pagamento, establishmentId })),
              }),
            ]
          : []),
      ]);
    },

    async cryptoPorSimbolo(symbol: string) {
      return prisma.crypto.upsert({
        where: { symbol: symbol.toUpperCase() },
        create: { symbol: symbol.toUpperCase(), name: symbol.toUpperCase() },
        update: {},
      });
    },

    confirmarPagamentos(establishmentId: string, quando: Date) {
      return prisma.acceptedPayment.updateMany({
        where: { establishmentId },
        data: { lastConfirmedAt: quando },
      });
    },

    async listarSugestoes(filtros: {
      status: Prisma.SuggestionWhereInput['status'];
      page: number;
      perPage: number;
    }) {
      const where = { status: filtros.status };

      const [registros, total] = await Promise.all([
        prisma.suggestion.findMany({
          where,
          include: { establishment: { select: { slug: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (filtros.page - 1) * filtros.perPage,
          take: filtros.perPage,
        }),
        prisma.suggestion.count({ where }),
      ]);

      return { registros, total };
    },

    sugestaoPorId(id: string) {
      return prisma.suggestion.findUnique({ where: { id } });
    },

    atualizarSugestao(id: string, dados: Prisma.SuggestionUncheckedUpdateInput) {
      return prisma.suggestion.update({ where: { id }, data: dados });
    },

    registrarAuditoria(dados: Prisma.AuditLogUncheckedCreateInput) {
      return prisma.auditLog.create({ data: dados });
    },
  };
}

export type AdminRepository = ReturnType<typeof criarAdminRepository>;
