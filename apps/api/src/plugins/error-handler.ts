import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from '../shared/errors.js';

/**
 * Um unico formato de erro para toda a API (docs/04-api-v1.md):
 * { error: { code, message, details? } }
 */
export const errorHandler = fp(async (app: FastifyInstance) => {
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: { code: 'NOT_FOUND', message: `Rota ${request.method} ${request.url} nao existe` },
    });
  });

  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parametros invalidos',
          details: error.validation.map((issue) => ({
            path: issue.instancePath.replace(/^\//, ''),
            message: issue.message ?? 'valor invalido',
          })),
        },
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, details: error.details },
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Muitas requisicoes. Tente de novo em instantes.' },
      });
    }

    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }

    request.log.error({ err: error }, 'erro nao tratado');

    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno' },
    });
  });
});
