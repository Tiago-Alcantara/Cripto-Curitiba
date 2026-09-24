export type Post = {
  tag: string;
  titulo: string;
  resumo: string;
  data: string;
  rotuloImagem: string;
};

const MESES: Record<string, string> = {
  jan: '01',
  fev: '02',
  mar: '03',
  abr: '04',
  mai: '05',
  jun: '06',
  jul: '07',
  ago: '08',
  set: '09',
  out: '10',
  nov: '11',
  dez: '12',
};

/** `'12 set 2026'` (formato de exibicao do post) -> `'2026-09-12'` (ISO, para JSON-LD). */
export function dataParaIso(data: string): string | undefined {
  const [dia, mesAbreviado, ano] = data.split(' ');
  const mes = MESES[mesAbreviado?.toLowerCase() ?? ''];

  if (!dia || !mes || !ano) return undefined;

  return `${ano}-${mes}-${dia.padStart(2, '0')}`;
}

/**
 * Conteudo de exemplo do Caderno, vindo do handoff de design. Ainda nao ha
 * CMS nem rota de post: troque por materias reais antes de divulgar a pagina.
 */
export const POSTS: Post[] = [
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
