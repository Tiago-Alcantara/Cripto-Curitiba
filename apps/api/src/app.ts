import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { type Env, loadEnv, parseCorsOrigins } from './env.js';
import { cryptosRoutes } from './modules/cryptos/cryptos.routes.js';
import { establishmentsRoutes } from './modules/establishments/establishments.routes.js';
import { errorHandler } from './plugins/error-handler.js';
import { prismaPlugin } from './plugins/prisma.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

export async function buildApp(
  envOverrides: Partial<NodeJS.ProcessEnv> = {},
): Promise<FastifyInstance> {
  const env = loadEnv({ ...process.env, ...envOverrides });

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
  });

  app.decorate('config', env);
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: parseCorsOrigins(env.CORS_ORIGINS),
    // Nenhuma requisicao autenticada sai do browser direto para a API: o painel
    // passa pelo BFF do Next (ADR-0006). Sem cookies, sem credenciais.
    credentials: false,
  });
  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    // Em teste o limite so atrapalha; as rotas sensiveis tem limite proprio.
    enableDraftSpec: true,
    skipOnError: true,
    allowList: () => env.NODE_ENV === 'test',
  });

  await app.register(errorHandler);
  await app.register(prismaPlugin);

  app.get('/api/v1/health', async () => ({ status: 'ok', uptime: process.uptime() }));

  app.get('/api/v1/health/db', async () => {
    await app.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'ok' };
  });

  await app.register(
    async (api) => {
      await api.register(establishmentsRoutes);
      await api.register(cryptosRoutes);
    },
    { prefix: '/api/v1' },
  );

  return app;
}
