import { timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

/**
 * Comparacao em tempo constante: evita que a diferenca de tempo de resposta
 * entregue quanto do segredo o chamador acertou.
 */
export function segredosIguais(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * IP real do visitante para rate limit e anti-spam.
 *
 * A API so enxerga a conexao do BFF do Next (ADR-0006), nunca a do browser.
 * Sem um segredo compartilhado, confiar em `X-Forwarded-For` deixaria
 * qualquer chamada direta a API forjar o IP e burlar os limites — por isso
 * so usamos o IP repassado pelo BFF quando o segredo bate; caso contrario,
 * caimos no IP da conexao real (`request.ip`, com `trustProxy: 1` so confia
 * no Caddy da propria API).
 */
export function ipReal(request: FastifyRequest, segredo: string | undefined): string {
  const segredoRecebido = request.headers['x-proxy-trust-secret'];
  const ipRepassado = request.headers['x-forwarded-client-ip'];

  if (
    segredo &&
    typeof segredoRecebido === 'string' &&
    segredosIguais(segredoRecebido, segredo) &&
    typeof ipRepassado === 'string' &&
    ipRepassado.trim()
  ) {
    return ipRepassado.trim();
  }

  return request.ip;
}
