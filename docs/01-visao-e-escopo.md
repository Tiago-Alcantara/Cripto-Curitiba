# 01 — Visão e escopo

## Conceito

Hub web de criptomoedas da cidade de Curitiba. A plataforma nasce com **um único
ramo** (diretório de estabelecimentos que aceitam cripto) mas com a arquitetura
preparada para receber outros ramos depois (eventos, comunidades, P2P, vagas,
serviços). Nada além do diretório é construído agora — os outros módulos existem
apenas como espaço reservado na estrutura de pastas e no banco.

## Problema

Quem usa cripto em Curitiba não sabe onde gastar. Os diretórios existentes são
genéricos, desatualizados e não dizem o que interessa na prática: *qual* cripto o
lugar aceita, *por qual rede/forma* (Lightning? on-chain? USDT em qual rede?) e
*se a informação ainda vale hoje*.

## Pesquisa de mercado

| Concorrente | Alcance | Lacuna |
|---|---|---|
| Coinmap | Global | Dados antigos, sem curadoria, muitos locais fechados |
| BTC Map (btcmap.org) | Global | Só Bitcoin, depende do OpenStreetMap, UX técnica |
| Bitcoin.com Maps | Global | Foco em BCH, pouca cobertura BR |
| AceitaBitcoin, Bitmapa, Rota do Bitcoin, CoinMaply, Mapa Bitcoin (Transfero) | Brasil | Cobertura nacional rasa, nada hiperlocal em Curitiba |

**Nenhum é focado em Curitiba.** É a brecha do projeto.

### Diferenciais

1. **Curadoria local** — selo `verificado` (contato/visita confirmada pela equipe,
   com data) vs `reportado pela comunidade`. Transparência sobre a confiabilidade
   do dado é o produto.
2. **Detalhe de pagamento** — não basta "aceita bitcoin": mostrar rede, método e
   se é carteira própria ou processador.
3. **Recência explícita** — "confirmado em 12/2025" em cada local. Diretório de
   cripto morre de desatualização; mostrar a data é defesa contra isso.
4. **Conteúdo local** — bairros, mapa da cidade, linguagem curitibana.

### Semente de conteúdo

A **Tartuferia San Paulo** é citada como um dos primeiros estabelecimentos de
Curitiba a aceitar bitcoin — entra no seed do MVP. Meta de lançamento:
**20 a 30 estabelecimentos**, com pelo menos 10 `verificados`, levantados a partir
de BTC Map/Coinmap + contato direto (telefone/Instagram) + comunidades locais.

## Público

- **Primário:** quem já tem cripto e mora/passa por Curitiba e quer gastar.
- **Secundário:** donos de estabelecimento buscando visibilidade ao aceitar cripto.
- **Terciário:** turista/nômade cripto ("onde gasto BTC em Curitiba?").

## Escopo do MVP

### Dentro

- Listagem de estabelecimentos com filtros (bairro, categoria, cripto, método de pagamento, busca textual)
- Página de detalhe por estabelecimento (SEO-friendly, com slug)
- Mapa com os locais plotados
- Selo de verificação + data da última confirmação
- Formulário público de sugestão/correção (novo local, atualização, reporte de erro)
- Painel admin: CRUD de estabelecimentos + moderação das sugestões
- Páginas institucionais: sobre, como funciona a verificação, contato
- SEO básico: sitemap, metadata, JSON-LD

### Fora (explicitamente adiado)

- Contas de usuário final, login social, favoritos
- Avaliações/reviews e comentários
- Módulos de eventos, comunidades, P2P, vagas
- App mobile / PWA offline
- Qualquer integração de pagamento ou custódia (o projeto **não** movimenta cripto)
- Múltiplas cidades e internacionalização
- Área do lojista (autogestão do próprio cadastro)

## Métricas de sucesso (3 meses pós-lançamento)

| Métrica | Alvo |
|---|---|
| Estabelecimentos publicados | 60+ |
| % verificados | ≥ 50% |
| Sugestões da comunidade recebidas/mês | 10+ |
| Visitantes únicos/mês | 1.000 |
| Cliques em "como chegar"/contato | 15% das visitas de detalhe |

## Riscos

| Risco | Mitigação |
|---|---|
| Dado desatualizado (loja parou de aceitar) | Data de confirmação visível + rotina de recheck a cada 6 meses + botão "reportar erro" em cada página |
| Poucos estabelecimentos = site vazio | Seed manual antes do lançamento; não lançar com menos de 20 |
| Spam no formulário de sugestão | Rate limit + honeypot + Cloudflare Turnstile + moderação obrigatória |
| VPS única é ponto de falha | Frontend na Vercel com ISR continua servindo conteúdo mesmo com a API fora; backups diários do Postgres |
| LGPD (dados de contato de terceiros) | Só dados comerciais públicos; canal de remoção por e-mail; política de privacidade no ar no lançamento |
