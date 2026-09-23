export type Post = {
  tag: string;
  titulo: string;
  resumo: string;
  data: string;
  rotuloImagem: string;
};

/**
 * Conteudo de exemplo do Caderno, vindo do handoff de design. Ainda nao ha
 * CMS nem rota de post: troque por materias reais antes de divulgar a pagina.
 */
export const POSTS: Post[] = [
  {
    tag: 'Comunidade',
    titulo: 'Encontro cripto no Largo da Ordem reúne 40 pessoas',
    resumo:
      'O primeiro meetup presencial da CriptoCuritiba discutiu adoção local, taxas e apresentou quatro estabelecimentos novos para o registro.',
    data: '12 set 2026',
    rotuloImagem: 'foto: Largo da Ordem',
  },
  {
    tag: 'Guia',
    titulo: 'Como funciona o selo de verificação',
    resumo:
      'A diferença entre "verificado" e "reportado pela comunidade" — e por que a data importa tanto quanto o selo.',
    data: '02 set 2026',
    rotuloImagem: 'foto: selo',
  },
  {
    tag: 'Histórias',
    titulo: 'Tartuferia San Paulo: pioneira em aceitar bitcoin na cidade',
    resumo:
      'A história do primeiro restaurante curitibano a aceitar cripto, ainda antes do registro existir.',
    data: '20 ago 2026',
    rotuloImagem: 'foto: restaurante',
  },
  {
    tag: 'Educação',
    titulo: 'Lightning Network: o que os lojistas precisam saber',
    resumo: 'Um guia curto para quem quer aceitar bitcoin sem taxas nem complicação no caixa.',
    data: '05 ago 2026',
    rotuloImagem: 'foto: lightning',
  },
];
