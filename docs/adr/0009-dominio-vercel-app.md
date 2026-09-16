# ADR-0009 — Frontend em `*.vercel.app` e hostname da API

**Status:** **Aceita** (requisito do projeto) · 2026-09

## Contexto

O frontend roda no domínio gratuito da Vercel (`https://cripto-curitiba.vercel.app`),
sem domínio próprio no lançamento. A API continua na VPS.

Duas restrições técnicas decorrem disso:

1. **`vercel.app` está na Public Suffix List.** Nenhum cookie pode ser setado com
   `Domain=.vercel.app`, e front e API não compartilham domínio registrável.
2. **A página é servida em HTTPS.** Todo `fetch` precisa ser HTTPS também — o
   browser bloqueia mixed content. Ou seja, a API **precisa** de certificado, e
   certificado precisa de hostname (Let's Encrypt não emite para IP puro no fluxo
   padrão do Caddy).

## Decisão

- O site público fica em `https://<projeto>.vercel.app`.
- A autenticação do admin usa BFF nos Route Handlers do Next, não cookie
  compartilhado ([ADR-0006](0006-auth-admin.md)).
- A API fica atrás de um hostname dedicado com TLS automático do Caddy. Duas rotas,
  nesta ordem de preferência:

| Rota | Quando | Hostname |
|---|---|---|
| **A** | Já existe (ou vale a pena registrar) um domínio | `api.<seu-dominio>` |
| **B** | Custo zero | Subdomínio **DuckDNS** apontando para o IP da VPS: `criptocuritiba-api.duckdns.org` |

A rota B é gratuita, resolve por DNS normal e o Caddy emite o certificado pelo
desafio HTTP-01 sem configuração extra. Os documentos usam esse hostname como
placeholder.

## Consequências

- **Trocar para domínio próprio depois custa quase nada:** muda
  `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, `PUBLIC_UPLOADS_URL` e o
  hostname do Caddyfile. Nenhuma linha de código depende do domínio, e a auth não
  muda (por causa do ADR-0006).
- **SEO:** subdomínio `vercel.app` é indexado normalmente pelo Google, mas sem
  branding próprio e sem autoridade acumulada no domínio. Como o canal principal do
  projeto é busca local, isso é a maior desvantagem prática da decisão.
- **Migração futura de domínio** exige 301 do `vercel.app` para o novo domínio (a
  Vercel faz com o domínio antigo mantido como redirect) e *Change of Address* no
  Search Console. Por isso: **manter os paths estáveis desde o início**
  (`/estabelecimentos/[slug]`), para que a migração seja só troca de host.
- `sslip.io`/`nip.io` funcionariam como alternativa à DuckDNS, mas dependem de um
  resolvedor de terceiros e compartilham limites de emissão do Let's Encrypt com
  todo mundo que usa o serviço. DuckDNS é a opção mais previsível.
- Uploads continuam sendo servidos pelo hostname da API — como já são URLs
  absolutas no banco, uma troca de hostname futura é um `UPDATE` de reescrita.
