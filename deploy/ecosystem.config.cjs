// Configuracao do PM2 para a API (ADR-0003: sem Docker por enquanto).
module.exports = {
  apps: [
    {
      name: 'criptocuritiba-api',
      cwd: '/home/deploy/cripto-curitiba/apps/api',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      autorestart: true,
      // Nao reiniciar em loop se o processo morrer logo no boot (env errada,
      // banco fora): melhor falhar visivelmente do que mascarar o problema.
      min_uptime: '20s',
      max_restarts: 5,
      env: {
        NODE_ENV: 'production',
        PORT: 3333,
        HOST: '127.0.0.1',
      },
    },
  ],
};
