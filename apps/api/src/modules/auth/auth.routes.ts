import { erroSchema } from '@cripto/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ipReal } from '../../shared/client-ip.js';
import { criarAuthService } from './auth.service.js';

const usuarioSchema = z.object({
  id: z.string(),
  email: z.string(),
  nome: z.string(),
  papel: z.enum(['OWNER', 'EDITOR']),
});

export async function authRoutes(app: FastifyInstance) {
  const service = criarAuthService({
    prisma: app.prisma,
    assinar: (payload) => app.jwt.sign(payload),
  });

  const rotas = app.withTypeProvider<ZodTypeProvider>();

  rotas.post(
    '/admin/auth/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
          keyGenerator: (request) => ipReal(request, app.config.PROXY_TRUST_SECRET),
        },
      },
      schema: {
        body: z.object({ email: z.email(), senha: z.string().min(1) }),
        response: {
          200: z.object({ token: z.string(), usuario: usuarioSchema }),
          401: erroSchema,
          429: erroSchema,
        },
      },
    },
    async (request) => {
      const { email, senha } = request.body;
      const { token, usuario } = await service.login(email, senha);

      request.log.info({ usuario: usuario.email }, 'login do admin');

      return { token, usuario };
    },
  );

  rotas.get(
    '/admin/auth/me',
    {
      preHandler: [app.exigirAdmin],
      schema: { response: { 200: usuarioSchema, 401: erroSchema } },
    },
    async (request) => request.user,
  );
}
