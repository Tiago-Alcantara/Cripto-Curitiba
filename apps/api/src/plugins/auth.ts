import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { UsuarioAutenticado } from '../modules/auth/auth.service.js';
import { ForbiddenError, UnauthorizedError } from '../shared/errors.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UsuarioAutenticado;
    user: UsuarioAutenticado;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    exigirAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    exigirDono: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Autenticacao por Bearer, nao por cookie: quem guarda o token e o BFF do Next
 * na origem da Vercel (ADR-0006). A API nunca emite nem le cookies.
 */
export const authPlugin = fp(async (app: FastifyInstance) => {
  const secret = app.config.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET e obrigatoria para as rotas de admin');
  }

  await app.register(fastifyJwt, {
    secret,
    sign: { expiresIn: app.config.JWT_EXPIRES_IN },
  });

  app.decorate('exigirAdmin', async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError('Sessao invalida ou expirada');
    }
  });

  app.decorate('exigirDono', async (request: FastifyRequest, reply: FastifyReply) => {
    await app.exigirAdmin(request, reply);

    if (request.user.papel !== 'OWNER') {
      throw new ForbiddenError('Somente o dono pode fazer isso');
    }
  });
});
