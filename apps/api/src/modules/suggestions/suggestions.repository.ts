import type { Prisma, PrismaClient } from '@cripto/db';

export function criarSuggestionsRepository(prisma: PrismaClient) {
  return {
    criar(dados: Prisma.SuggestionUncheckedCreateInput) {
      return prisma.suggestion.create({ data: dados });
    },

    contarRecentesPorIp(ipHash: string, desde: Date) {
      return prisma.suggestion.count({ where: { ipHash, createdAt: { gte: desde } } });
    },

    estabelecimentoExiste(id: string) {
      return prisma.establishment.findUnique({ where: { id }, select: { id: true } });
    },
  };
}

export type SuggestionsRepository = ReturnType<typeof criarSuggestionsRepository>;
