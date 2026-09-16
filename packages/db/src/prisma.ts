import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './client/client.js';

/**
 * Prisma 7 nao le mais a connection string do schema: o cliente recebe um
 * driver adapter (aqui, `pg`). A URL vem sempre do ambiente de quem chama.
 */
export function createPrismaClient(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!connectionString) {
    throw new Error('DATABASE_URL nao definida');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

declare global {
  var __criptoPrisma: PrismaClient | undefined;
}

/**
 * Cliente preguicoso, para scripts e tarefas pontuais. A API nao usa: ela cria
 * o cliente no plugin, a partir do env ja validado.
 *
 * O cache global existe porque em dev o `tsx watch` recarrega o modulo a cada
 * mudanca; sem ele, cada reload abriria um pool novo ate estourar o limite de
 * conexoes do Postgres.
 */
export function getPrisma(): PrismaClient {
  if (!globalThis.__criptoPrisma) {
    globalThis.__criptoPrisma = createPrismaClient();
  }

  return globalThis.__criptoPrisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (globalThis.__criptoPrisma) {
    await globalThis.__criptoPrisma.$disconnect();
    globalThis.__criptoPrisma = undefined;
  }
}
