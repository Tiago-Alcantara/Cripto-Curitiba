# Imagem da API (o frontend vai para a Vercel, nao para o Docker).
#
# Fica na raiz de proposito: o contexto de build precisa ser a raiz do
# repositorio, porque e um monorepo pnpm e a imagem depende de packages/.
# Deixar o arquivo aqui faz a configuracao padrao do Coolify funcionar sem
# ajuste de caminho — era ai que o primeiro deploy quebrava
# ("failed to read dockerfile: open Dockerfile: no such file or directory").

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

# openssl e exigido pelo engine de schema do Prisma (migrate deploy).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app


FROM base AS build

# Os package.json vem primeiro para a camada de dependencias so ser refeita
# quando as dependencias mudarem, nao a cada commit de codigo.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Instala o workspace inteiro: o lockfile e unico e `--frozen-lockfile` exige
# que todos os projetos declarados existam. Custa alguns MB de imagem e evita
# uma classe inteira de erro de resolucao.
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @cripto/db build \
  && pnpm --filter @cripto/shared build \
  && pnpm --filter @cripto/api build


FROM base AS runtime

ENV NODE_ENV=production
# Dentro do container a API precisa escutar em todas as interfaces; o padrao
# do codigo (127.0.0.1) deixaria o proxy do Coolify sem alcance.
ENV HOST=0.0.0.0
ENV PORT=3333

# node_modules vem com as dependencias de desenvolvimento de proposito: o CLI
# do Prisma roda no boot para aplicar as migrations.
COPY --from=build /app /app

RUN chmod +x apps/api/docker-entrypoint.sh \
  && mkdir -p /app/uploads

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["./apps/api/docker-entrypoint.sh"]
