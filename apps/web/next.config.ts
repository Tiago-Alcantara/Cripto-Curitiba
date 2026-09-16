import type { NextConfig } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos de estabelecimento sao servidas pelo Caddy no host da API.
    remotePatterns: [new URL(`${apiUrl.replace(/\/api\/v1$/, '')}/uploads/**`)],
  },
};

export default config;
