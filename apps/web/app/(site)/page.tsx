import Link from 'next/link';
import { ApiOffline } from '@/components/api-offline';
import { EstablishmentCard } from '@/components/establishment-card';
import { listarBairros, listarEstabelecimentos, tolerante } from '@/lib/api';

export const revalidate = 3600;

export default async function HomePage() {
  // Build da Vercel e render de pagina nao podem quebrar porque a VPS piscou.
  const [verificados, todos, bairros] = await Promise.all([
    tolerante(
      listarEstabelecimentos({ verificacao: 'verificado', perPage: '6', ordenar: 'verificados' }),
      null,
    ),
    tolerante(listarEstabelecimentos({ perPage: '1' }), null),
    tolerante(listarBairros(), null),
  ]);

  const dadosNoAr = todos !== null && bairros !== null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <section className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Onde gastar criptomoedas em Curitiba
        </h1>
        <p className="mt-4 text-lg text-muted">
          {dadosNoAr ? (
            <>
              {todos.meta.total} {todos.meta.total === 1 ? 'lugar mapeado' : 'lugares mapeados'} em{' '}
              {bairros.length} {bairros.length === 1 ? 'bairro' : 'bairros'} — com a forma de
              pagamento que cada um aceita e a data da última confirmação.
            </>
          ) : (
            <>
              O diretório dos lugares de Curitiba que aceitam criptomoedas, com a forma de pagamento
              que cada um aceita e a data da última confirmação.
            </>
          )}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/estabelecimentos"
            className="rounded-control bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover"
          >
            Ver todos os lugares
          </Link>
          <Link
            href="/sugerir"
            className="rounded-control border border-border bg-surface px-5 py-2.5 font-medium hover:border-primary/40"
          >
            Conhece um lugar? Sugira
          </Link>
        </div>
      </section>

      {!dadosNoAr ? (
        <section className="mt-12">
          <ApiOffline />
        </section>
      ) : null}

      {verificados && verificados.data.length > 0 ? (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-2xl">Verificados pela equipe</h2>
              <p className="mt-1 text-muted text-sm">
                Confirmados por contato ou visita, com data registrada.
              </p>
            </div>
            <Link
              href="/estabelecimentos?verificacao=verificado"
              className="shrink-0 text-primary text-sm hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {verificados.data.map((estabelecimento) => (
              <EstablishmentCard key={estabelecimento.id} estabelecimento={estabelecimento} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16 rounded-card border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-semibold text-xl">Como funciona a verificação</h2>
        <dl className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-verified">Verificado</dt>
            <dd className="mt-1 text-muted text-sm">
              Alguém da equipe confirmou por telefone, mensagem ou visita que o lugar aceita a
              cripto listada — e a data dessa confirmação fica visível.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-community">Reportado pela comunidade</dt>
            <dd className="mt-1 text-muted text-sm">
              Alguém informou pelo formulário e a equipe achou plausível, mas ainda não confirmou
              diretamente com o estabelecimento.
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-muted text-sm">
          Informação com mais de um ano sem confirmação é marcada para recheck. Encontrou algo
          errado?{' '}
          <Link href="/sugerir" className="text-primary hover:underline">
            Avise a gente
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
