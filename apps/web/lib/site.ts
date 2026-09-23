/** Itens do menu principal, na ordem do cabecalho e do rodape. */
export const NAVEGACAO = [
  { href: '/', rotulo: 'Início' },
  { href: '/mapa', rotulo: 'Mapa' },
  { href: '/indicar', rotulo: 'Indicar' },
  { href: '/sobre', rotulo: 'Sobre' },
  { href: '/caderno', rotulo: 'Caderno' },
] as const;

/**
 * Redes da comunidade no rodape. Sem URL, o item aparece como texto — melhor
 * que um link quebrado. Preencha quando os perfis existirem.
 */
export const REDES: { rotulo: string; url: string | null }[] = [
  { rotulo: 'Instagram', url: null },
  { rotulo: 'X / Twitter', url: null },
  { rotulo: 'Discord', url: null },
];
