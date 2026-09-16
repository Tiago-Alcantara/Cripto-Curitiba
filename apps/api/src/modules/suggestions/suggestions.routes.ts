import { erroSchema, novaSugestaoSchema, sugestaoCriadaSchema } from '@cripto/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { criarSuggestionsRepository } from './suggestions.repository.js';
import { criarSuggestionsService } from './suggestions.service.js';
import { criarVerificadorTurnstile } from './turnstile.js';

export async function suggestionsRoutes(app: FastifyInstance) {
  const service = criarSuggestionsService({
    repository: criarSuggestionsRepository(app.prisma),
    verificarTurnstile: criarVerificadorTurnstile(app.config.TURNSTILE_SECRET_KEY),
  });

  const rotas = app.withTypeProvider<ZodTypeProvider>();

  rotas.post(
    '/sugestoes',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 hour',
        },
      },
      schema: {
        body: novaSugestaoSchema,
        response: { 201: sugestaoCriadaSchema, 400: erroSchema, 429: erroSchema },
      },
    },
    async (request, reply) => {
      const resultado = await service.criar(request.body, {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(201).send(resultado);
    },
  );
}
