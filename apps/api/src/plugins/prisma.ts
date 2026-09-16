import { createPrismaClient, type PrismaClient } from '@cripto/db';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (app: FastifyInstance) => {
  const prisma = createPrismaClient(app.config.DATABASE_URL);

  app.decorate('prisma', prisma);
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
