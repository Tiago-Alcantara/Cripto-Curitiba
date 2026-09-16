# ADR-0003 — Sem Docker por enquanto; PM2 na VPS

**Status:** Aceita · 2026-09

## Contexto

Projeto pequeno, rodado apenas pelo próprio autor, em uma VPS que hoje não tem
outros serviços concorrendo.

## Decisão

Node instalado direto na VPS, processo Fastify gerenciado por **PM2** (restart
automático, boot com o sistema, logrotate). Postgres instalado como serviço do
sistema. Docker fica em aberto.

## Consequências

- Menos camadas para depurar e menos consumo de RAM na VPS.
- Ambiente de dev e produção não são idênticos — mitigado fixando a versão do Node (`.nvmrc`) e do Postgres.
- Setup da VPS é manual; por isso o passo a passo está documentado em [06-infra-e-deploy](../06-infra-e-deploy.md).

## Quando revisitar

- Quando houver um segundo serviço na mesma VPS, ou
- quando outra pessoa precisar rodar o projeto localmente, ou
- quando a divergência de ambiente causar o primeiro bug de produção.

Nessa hora, `docker-compose` cobre Postgres + API sem mudar a arquitetura.
