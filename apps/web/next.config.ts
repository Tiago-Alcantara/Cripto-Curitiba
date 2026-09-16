import type { NextConfig } from 'next';
import { padraoDeUploads } from './lib/env';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos de estabelecimento sao servidas pelo Caddy no host da API.
    remotePatterns: padraoDeUploads(),
  },
};

export default config;
