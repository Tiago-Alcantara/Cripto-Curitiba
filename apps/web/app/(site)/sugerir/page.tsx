import type { Metadata } from 'next';
import { SuggestionForm } from '@/components/suggestion-form';
import { buscarEstabelecimento, listarCriptomoedas, tolerante } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Sugerir um lugar',
  description:
    'Conhece um lugar em Curitiba que aceita criptomoedas? Sugira, atualize ou reporte um erro — tudo passa por moderação.',
};

type Props = {
  searchParams: Promise<{ tipo?: string; estabelecimento?: string }>;
};

const TIPOS_VALIDOS = ['novo_local', 'atualizacao', 'reporte_erro'] as const;

export default async function SugerirPage({ searchParams }: Props) {
  const { tipo, estabelecimento: slug } = await searchParams;

  const [criptos, estabelecimento] = await Promise.all([
    tolerante(listarCriptomoedas(), []),
    slug ? tolerante(buscarEstabelecimento(slug), null) : Promise.resolve(null),
  ]);

  const tipoInicial = TIPOS_VALIDOS.find((valido) => valido === tipo);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl">Sugerir um lugar</h1>
        <p className="mt-3 text-muted">
          O diretório só fica bom com gente da cidade avisando. Toda sugestão passa por moderação
          antes de entrar no ar — nada é publicado automaticamente.
        </p>
      </header>

      <SuggestionForm
        criptos={criptos}
        tipoInicial={estabelecimento ? (tipoInicial ?? 'reporte_erro') : tipoInicial}
        estabelecimentoInicial={
          estabelecimento ? { id: estabelecimento.id, nome: estabelecimento.nome } : null
        }
      />
    </div>
  );
}
