import type { NextConfig } from 'next';
import { padraoDeUploads } from './lib/env';

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
};

export default config;
