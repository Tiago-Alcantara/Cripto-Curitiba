import type { FastifyRequest } from 'fastify';
import { describe, expect, it } from 'vitest';
import { ipReal, segredosIguais } from '../src/shared/client-ip.js';

function requisicaoFalsa(headers: Record<string, string>, ip = '203.0.113.9'): FastifyRequest {
  return { headers, ip } as unknown as FastifyRequest;
}

describe('segredosIguais', () => {
  it('compara segredos iguais como verdadeiro', () => {
    expect(segredosIguais('abc123', 'abc123')).toBe(true);
  });

  it('compara segredos diferentes como falso, mesmo com tamanhos diferentes', () => {
    expect(segredosIguais('abc', 'abcdef')).toBe(false);
    expect(segredosIguais('abc', 'xyz')).toBe(false);
  });
});

describe('ipReal', () => {
  const SEGREDO = 'segredo-compartilhado-com-o-bff';

  it('sem segredo configurado, usa o IP da conexao', () => {
    const request = requisicaoFalsa({ 'x-forwarded-client-ip': '1.2.3.4' });
    expect(ipReal(request, undefined)).toBe('203.0.113.9');
  });

  it('sem os headers do BFF, usa o IP da conexao mesmo com segredo configurado', () => {
    const request = requisicaoFalsa({});
    expect(ipReal(request, SEGREDO)).toBe('203.0.113.9');
  });

  it('com o segredo certo, confia no IP repassado pelo BFF', () => {
    const request = requisicaoFalsa({
      'x-proxy-trust-secret': SEGREDO,
      'x-forwarded-client-ip': '9.9.9.9',
    });
    expect(ipReal(request, SEGREDO)).toBe('9.9.9.9');
  });

  it('com o segredo errado, ignora o IP forjado e usa o da conexao', () => {
    const request = requisicaoFalsa({
      'x-proxy-trust-secret': 'segredo-errado',
      'x-forwarded-client-ip': '9.9.9.9',
    });
    expect(ipReal(request, SEGREDO)).toBe('203.0.113.9');
  });
});
