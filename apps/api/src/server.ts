import 'dotenv/config';
import { buildApp } from './app.js';

const app = await buildApp();

const encerrar = async (sinal: string) => {
  app.log.info({ sinal }, 'encerrando');
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => void encerrar('SIGTERM'));
process.on('SIGINT', () => void encerrar('SIGINT'));

try {
  await app.listen({ host: app.config.HOST, port: app.config.PORT });
} catch (error) {
  app.log.error({ err: error }, 'falha ao subir a API');
  process.exit(1);
}
