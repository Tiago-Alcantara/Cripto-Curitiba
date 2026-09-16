import type { FastifyBaseLogger } from 'fastify';

type Opcoes = {
  frontendUrl?: string;
  secret?: string;
  logger: FastifyBaseLogger;
};

/**
 * Avisa o frontend para regenerar as paginas afetadas (ADR-0007).
 *
 * Falhar aqui NAO pode falhar a operacao do admin: o `revalidate` por tempo
 * cobre o atraso. Por isso so loga em warn.
 */
export async function revalidarFrontend(tags: string[], { frontendUrl, secret, logger }: Opcoes) {
  if (!frontendUrl || !secret) {
    logger.debug({ tags }, 'revalidacao ignorada: FRONTEND_URL ou REVALIDATE_SECRET ausente');
    return;
  }

  try {
    const resposta = await fetch(`${frontendUrl.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    });

    if (!resposta.ok) {
      logger.warn({ tags, status: resposta.status }, 'frontend recusou a revalidacao');
    }
  } catch (erro) {
    logger.warn({ tags, err: erro }, 'falha ao revalidar o frontend');
  }
}
