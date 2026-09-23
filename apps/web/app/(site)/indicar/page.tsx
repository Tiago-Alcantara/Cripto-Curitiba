import type { Metadata } from 'next';
import { FichaIndicacao } from '@/components/registro/ficha-indicacao';
import { buscarEstabelecimento, listarCriptomoedas, tolerante } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Indicar um local',
  description:
    'Conhece um lugar em Curitiba que aceita criptomoedas? Indique, atualize ou reporte um erro — tudo passa por verificação antes de entrar no registro.',
  alternates: { canonical: '/indicar' },
};

type Props = {
  searchParams: Promise<{ tipo?: string; estabelecimento?: string }>;
};

const TIPOS_DE_CORRECAO = ['atualizacao', 'reporte_erro'] as const;

export default async function IndicarPage({ searchParams }: Props) {
  const { tipo, estabelecimento: slug } = await searchParams;

  const [criptos, estabelecimento] = await Promise.all([
    tolerante(listarCriptomoedas(), []),
    slug ? tolerante(buscarEstabelecimento(slug), null) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto w-full max-w-[680px] animate-entrada px-7 pt-12 pb-[84px]">
      <FichaIndicacao
        criptos={criptos}
        tipoInicial={TIPOS_DE_CORRECAO.find((valido) => valido === tipo)}
        estabelecimentoInicial={
          estabelecimento ? { id: estabelecimento.id, nome: estabelecimento.nome } : null
        }
      />
    </div>
  );
}
