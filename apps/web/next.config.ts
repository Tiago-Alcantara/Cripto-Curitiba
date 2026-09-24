import type { NextConfig } from 'next';
import { API_URL, padraoDeUploads } from './lib/env';

/** Host que serve as fotos dos estabelecimentos, liberado no `img-src` da CSP. */
function hostDeUploads(): string {
  try {
    return new URL(API_URL).origin;
  } catch {
    return '';
  }
}

/**
 * Baseline de defesa em profundidade: nao ha XSS conhecido hoje, mas sem
 * nenhum header o site fica sem qualquer contencao se um dia aparecer um.
 * `script-src`/`style-src` levam `unsafe-inline` porque o site usa JSON-LD
 * inline (layout e paginas de estabelecimento) e Tailwind sem infra de nonce
 * por requisicao; apertar isso e evolucao futura, nao parte desta correcao.
 */
function csp(): string {
  const uploads = hostDeUploads();

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: https://*.tile.openstreetmap.org${uploads ? ` ${uploads}` : ''}`,
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com",
    'frame-src https://challenges.cloudflare.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos de estabelecimento sao servidas pelo Caddy no host da API.
    remotePatterns: padraoDeUploads(),
  },
  // Rotas antigas do v1: links compartilhados continuam funcionando (a query
  // string, com filtros e ?estabelecimento=, e repassada).
  async redirects() {
    return [
      { source: '/sugerir', destination: '/indicar', permanent: true },
      { source: '/estabelecimentos', destination: '/mapa', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp() },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default config;
