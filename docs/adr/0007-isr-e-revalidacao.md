# ADR-0007 — ISR com revalidação sob demanda

**Status:** Aceita · 2026-09

## Contexto

Os dados mudam raras vezes por semana, mas a leitura pública é o grosso do tráfego.
A API roda em uma VPS modesta; a Vercel tem CDN global de graça.

## Decisão

Páginas de listagem e detalhe usam ISR (`revalidate: 3600`) com cache por tags
(`estabelecimentos`, `estabelecimento:<slug>`). Ao publicar, editar ou arquivar um
registro, a API chama `POST /api/revalidate` no frontend com um secret, e o
conteúdo se atualiza em segundos.

## Consequências

- A VPS praticamente não recebe tráfego de leitura; um pico de acessos bate na CDN.
- Se a API cair, o site continua servindo as páginas já geradas.
- A falha de revalidação não pode quebrar a operação do admin: é logada como
  `warn`, e o `revalidate` por tempo é a rede de segurança.
- O filtro dinâmico na listagem roda no cliente sobre o payload já cacheado.
