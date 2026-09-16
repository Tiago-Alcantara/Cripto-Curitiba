# 04 — API REST v1

Base: `https://api.criptocuritiba.com.br/api/v1`

REST versionado por path. Sem GraphQL nesta fase ([ADR-0004](adr/0004-rest-versionado.md)).
Payloads em JSON, `camelCase` nas chaves, caminhos públicos em português.

## Convenções

- Listagens retornam `{ "data": [...], "meta": { "page", "perPage", "total", "totalPages" } }`
- Recursos únicos retornam o objeto direto
- Datas em ISO 8601 UTC
- Erros seguem um formato único:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parâmetros inválidos",
    "details": [{ "path": "categoria", "message": "valor não permitido" }]
  }
}
```

Códigos: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403),
`NOT_FOUND` (404), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500).

## Público (sem autenticação)

### `GET /estabelecimentos`

Query params (todos opcionais):

| Param | Tipo | Nota |
|---|---|---|
| `q` | string | busca em nome, descrição e bairro |
| `bairro` | string | slug do bairro; repetível |
| `categoria` | enum | `restaurante`, `cafe`, `bar`, ...; repetível |
| `cripto` | string | símbolo (`BTC`); repetível — OR entre valores |
| `metodo` | enum | `lightning`, `onchain`, `evm`, ...; repetível |
| `verificacao` | enum | `verificado`, `comunidade` |
| `bbox` | string | `minLng,minLat,maxLng,maxLat` (uso do mapa) |
| `page`, `perPage` | int | default `1` / `24`, máx `100` |
| `ordenar` | enum | `recentes` (default), `nome`, `verificados` |

Só retorna `status = PUBLISHED`. Resposta enxuta (sem descrição longa, sem todas
as fotos) — o suficiente para card e pin de mapa:

```json
{
  "data": [{
    "id": "clx...",
    "slug": "tartuferia-san-paulo",
    "nome": "Tartuferia San Paulo",
    "categoria": "restaurante",
    "bairro": "Batel",
    "latitude": -25.44,
    "longitude": -49.29,
    "fotoCapa": "https://.../capa.webp",
    "verificacao": { "status": "verificado", "em": "2026-02-10T00:00:00Z" },
    "pagamentos": [
      { "cripto": "BTC", "metodo": "lightning", "confirmadoEm": "2026-02-10T00:00:00Z" },
      { "cripto": "BTC", "metodo": "onchain",   "confirmadoEm": "2026-02-10T00:00:00Z" }
    ]
  }],
  "meta": { "page": 1, "perPage": 24, "total": 27, "totalPages": 2 }
}
```

### `GET /estabelecimentos/:slug`

Registro completo: descrição, endereço, contatos, `openingHours`, todas as fotos,
pagamentos com `custody`/`network`/`note`, dados de verificação. `404` se não
estiver publicado.

### `GET /criptomoedas`

Catálogo ativo, com contagem de estabelecimentos por moeda (alimenta o filtro).

### `GET /bairros`

Bairros que têm ao menos um estabelecimento publicado, com contagem. Facetas
vindas do banco, não hardcoded.

### `POST /sugestoes`

Rate limit: 5/hora por IP. Exige token do Turnstile + campo honeypot vazio.

```json
{
  "tipo": "novo_local",
  "estabelecimentoId": null,
  "dados": { "nome": "...", "bairro": "...", "criptos": ["BTC"], "metodos": ["lightning"] },
  "mensagem": "Paguei com Lightning ontem",
  "remetente": { "nome": "Fulano", "email": "f@ex.com" },
  "turnstileToken": "..."
}
```

Retorna `201 { "id": "...", "status": "pendente" }`. Nada aparece no site antes de
moderação.

### `GET /health` · `GET /health/db`

## Admin (autenticado)

Cookie de sessão `httpOnly` ([ADR-0006](adr/0006-auth-admin.md)). Toda rota exige sessão válida.

| Método | Rota | Ação |
|---|---|---|
| `POST` | `/admin/auth/login` | e-mail + senha → cookie. Rate limit 5/15min por IP |
| `POST` | `/admin/auth/logout` | invalida a sessão |
| `GET` | `/admin/auth/me` | usuário atual |
| `GET` | `/admin/estabelecimentos` | lista incluindo `DRAFT`/`ARCHIVED`, com filtros |
| `POST` | `/admin/estabelecimentos` | cria (slug gerado do nome, colisão → sufixo) |
| `PATCH` | `/admin/estabelecimentos/:id` | edita |
| `POST` | `/admin/estabelecimentos/:id/publicar` | `DRAFT` → `PUBLISHED` + revalidação ISR |
| `POST` | `/admin/estabelecimentos/:id/verificar` | marca verificado, grava `verifiedAt`/`verifiedBy`/nota |
| `DELETE` | `/admin/estabelecimentos/:id` | arquiva (soft) — `ARCHIVED`, nunca apaga |
| `PUT` | `/admin/estabelecimentos/:id/pagamentos` | substitui o conjunto de pagamentos aceitos |
| `POST` | `/admin/estabelecimentos/:id/fotos` | upload de foto |
| `GET` | `/admin/sugestoes` | fila de moderação (`?status=pendente`) |
| `POST` | `/admin/sugestoes/:id/aprovar` | cria/atualiza o estabelecimento a partir do payload |
| `POST` | `/admin/sugestoes/:id/rejeitar` | com nota |
| `GET/POST/PATCH` | `/admin/criptomoedas` | catálogo de moedas |

## Revalidação do ISR

Após publicar/editar/arquivar, a API chama o frontend:

```
POST https://criptocuritiba.com.br/api/revalidate
x-revalidate-secret: <REVALIDATE_SECRET>
{ "tags": ["estabelecimentos", "estabelecimento:tartuferia-san-paulo"] }
```

Falha na revalidação **não** falha a operação do admin: loga em nível `warn`; o
`revalidate` por tempo cobre o atraso.

## Rate limit

| Escopo | Limite |
|---|---|
| Global por IP | 120 req/min |
| `POST /sugestoes` | 5/hora |
| `POST /admin/auth/login` | 5/15min |

## Upload de fotos

MVP: upload para o disco da VPS em `/var/www/criptocuritiba/uploads`, servido pelo
Caddy em `https://api.criptocuritiba.com.br/uploads/*`, com conversão para WebP e
limite de 5 MB por arquivo (`@fastify/multipart`). Objeto externo (R2/S3) fica
para quando houver volume — a URL já é armazenada como string absoluta, então a
migração é só reescrever URLs.
