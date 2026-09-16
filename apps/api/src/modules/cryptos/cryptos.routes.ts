import { criptoSchema } from '@cripto/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function cryptosRoutes(app: FastifyInstance) {
  const rotas = app.withTypeProvider<ZodTypeProvider>();

  rotas.get(
    '/criptomoedas',
    { schema: { response: { 200: z.array(criptoSchema) } } },
    async (_request, reply) => {
      reply.header('cache-control', 'public, s-maxage=300, stale-while-revalidate=3600');

      const cryptos = await app.prisma.crypto.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { symbol: 'asc' }],
        include: {
          _count: {
            select: { acceptedBy: { where: { establishment: { status: 'PUBLISHED' } } } },
          },
        },
      });

      return cryptos.map((crypto) => ({
        symbol: crypto.symbol,
        nome: crypto.name,
        iconUrl: crypto.iconUrl,
        totalEstabelecimentos: crypto._count.acceptedBy,
      }));
    },
  );
}
