import Link from 'next/link';
import { ApiOffline } from '@/components/api-offline';
import { Curadoria } from '@/components/registro/curadoria';
import { EstufaCta } from '@/components/registro/estufa-cta';
import { FichaDestaque } from '@/components/registro/ficha-destaque';
import { Pinhoes } from '@/components/registro/pinhoes';
import { PortalPasseio } from '@/components/registro/portal-passeio';
import { QuatroVaos } from '@/components/registro/quatro-vaos';
import { botaoPrimario, botaoSecundario, Cornija } from '@/components/registro/ui';
import { listarBairros, listarCriptomoedas, listarEstabelecimentos, tolerante } from '@/lib/api';
import { numerarFichas } from '@/lib/registro';

export const revalidate = 3600;

function Contador({
  valor,
  rotulo,
  ultimo = false,
}: {
  valor: number | null;
  rotulo: string;
  ultimo?: boolean;
}) {
  return (
    <div className={`py-[22px] pr-5 pl-5 first:pl-0 ${ultimo ? '' : 'border-regua border-r'}`}>
      <div className="font-display font-medium text-[32px] leading-none">{valor ?? '—'}</div>
      <div className="mt-1.5 font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.14em]">
        {rotulo}
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Build da Vercel e render de pagina nao podem quebrar porque a VPS piscou.
  const [todos, verificados, bairros, criptos] = await Promise.all([
    tolerante(listarEstabelecimentos({ perPage: '100' }), null),
    tolerante(
      listarEstabelecimentos({ verificacao: 'verificado', perPage: '3', ordenar: 'verificados' }),
      null,
    ),
    tolerante(listarBairros(), null),
    tolerante(listarCriptomoedas(), null),
  ]);

  const dadosNoAr = todos !== null && verificados !== null && bairros !== null;
  const numeros = todos ? numerarFichas(todos.data, todos.meta.total) : new Map<string, string>();
  const moedasAceitas = criptos ? criptos.filter((c) => c.totalEstabelecimentos > 0).length : null;

  return (
    <div className="animate-entrada">
      <section className="mx-auto grid max-w-[1140px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-14 px-7 pt-[60px] pb-[52px]">
        <div>
          <div className="mb-[22px] font-mono text-[10.5px] text-tinta-fraca uppercase tracking-[0.2em]">
            Almanaque de estabelecimentos · desde 2026
          </div>
          <h1 className="mt-0 mb-[22px] font-display font-medium text-[clamp(40px,6.2vw,68px)] leading-[0.98] tracking-[-0.02em]">
            Onde usar <em className="font-normal italic">cripto</em> em Curitiba
          </h1>
          <p className="mt-0 mb-[30px] max-w-[460px] text-[17px] text-tinta-media leading-[1.62]">
            Um registro vivo da cidade, mantido por quem mora aqui: cafés, bares, lojas e serviços
            que aceitam Bitcoin e outras criptomoedas — cada um com selo de confiança e data de
            confirmação.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mapa" className={botaoPrimario}>
              Consultar o mapa
            </Link>
            <Link href="/indicar" className={botaoSecundario}>
              Indicar um local
            </Link>
          </div>
        </div>

        <PortalPasseio />
      </section>

      <section className="border-regua border-y bg-papel-quente">
        <div className="mx-auto grid max-w-[1140px] grid-cols-[repeat(auto-fit,minmax(190px,1fr))] px-7">
          <Contador valor={todos?.meta.total ?? null} rotulo="locais no registro" />
          <Contador valor={verificados?.meta.total ?? null} rotulo="verificados em campo" />
          <Contador valor={bairros?.length ?? null} rotulo="bairros alcançados" />
          <Contador valor={moedasAceitas} rotulo="moedas aceitas" ultimo />
        </div>
      </section>

      {!dadosNoAr ? (
        <section className="mx-auto mt-12 max-w-[1140px] px-7">
          <ApiOffline />
        </section>
      ) : null}

      <QuatroVaos />

      {verificados && verificados.data.length > 0 ? (
        <section className="mx-auto max-w-[1140px] px-7 pt-16">
          <div className="mb-1.5 flex flex-wrap items-end justify-between gap-3.5 border-tinta border-b-[3px] pb-3">
            <h2 className="m-0 font-display font-medium text-[clamp(26px,3.2vw,34px)] leading-none">
              Verificados em campo
            </h2>
            <Link
              href="/mapa?verificacao=verificado"
              className="pb-0.5 font-bold text-[11.5px] text-verde uppercase tracking-[0.11em] hover:text-verde-escuro"
            >
              Ver todos no mapa →
            </Link>
          </div>
          <div className="mb-[26px] h-px bg-tinta" />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
            {verificados.data.map((estabelecimento) => (
              <FichaDestaque
                key={estabelecimento.id}
                estabelecimento={estabelecimento}
                numero={numeros.get(estabelecimento.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mx-auto mt-14 max-w-[1140px] px-7">
        <Cornija />
      </div>

      <Pinhoes total={todos?.meta.total ?? null} />
      <Curadoria />
      <EstufaCta />
    </div>
  );
}
