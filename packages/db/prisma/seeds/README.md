# Dados de seed

- `cryptos.json` — catálogo de moedas. Dado factual, vai para qualquer ambiente.
- `establishments.json` — **dados de desenvolvimento**.

Sobre `establishments.json`: os registros com nome começando em "Exemplo" são
fictícios, existem só para popular o ambiente local e **nunca** devem ir para
produção. Por isso o seed ignora esse arquivo quando `NODE_ENV=production` —
lá ele cria apenas o catálogo de criptomoedas e o usuário admin. Para popular
um ambiente de teste que roda em modo produção, use `SEED_EXEMPLOS=1`.

A Tartuferia San Paulo é um estabelecimento real, citado na pesquisa como um dos
primeiros de Curitiba a aceitar bitcoin. Ela entra como `DRAFT` e
`COMMUNITY_REPORTED`, sem endereço completo e sem data de confirmação: o
projeto não publica informação de estabelecimento real antes da curadoria
confirmar endereço, formas de pagamento aceitas e se a informação ainda vale.
Publicar é decisão do admin, depois de verificar.
