import { rotulos } from '@cripto/shared';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CryptoChip } from '@/components/crypto-chip';
import { VerificationBadge } from '@/components/verification-badge';
import { buscarEstabelecimento, listarPublicados, tolerante } from '@/lib/api';
import {
  confirmacaoMaisRecente,
  descreverPagamento,
  enderecoEmLinha,
  faixaPreco,
  listarHorarios,
  urlComoChegar,
} from '@/lib/formatters';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const publicados = await tolerante(listarPublicados(), []);
  return publicados.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const estabelecimento = await buscarEstabelecimento(slug);

  if (!estabelecimento) return { title: 'Local não encontrado' };

  const criptos = [...new Set(estabelecimento.pagamentos.map((p) => p.cripto))].join(', ');

  return {
    title: `${estabelecimento.nome} — aceita ${criptos || 'cripto'} em ${estabelecimento.bairro}`,
    description:
      estabelecimento.descricao ??
      `${estabelecimento.nome}, em ${estabelecimento.bairro}, Curitiba. Formas de pagamento em cripto aceitas e data da última confirmação.`,
    alternates: { canonical: `/estabelecimentos/${estabelecimento.slug}` },
    openGraph: {
      title: estabelecimento.nome,
      images: estabelecimento.fotoCapa ? [estabelecimento.fotoCapa] : undefined,
    },
  };
}

export default async function EstabelecimentoPage({ params }: Props) {
  const { slug } = await params;
  const estabelecimento = await buscarEstabelecimento(slug);

  if (!estabelecimento) notFound();

  const confirmadoEm =
    confirmacaoMaisRecente(estabelecimento.pagamentos) ?? estabelecimento.verificacao.em;
  const horarios = listarHorarios(estabelecimento.horarios);
  const preco = faixaPreco(estabelecimento.faixaPreco);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': estabelecimento.categoria === 'restaurante' ? 'Restaurant' : 'LocalBusiness',
    name: estabelecimento.nome,
    description: estabelecimento.descricao ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [estabelecimento.endereco.rua, estabelecimento.endereco.numero]
        .filter(Boolean)
        .join(', '),
      addressLocality: estabelecimento.endereco.cidade,
      addressRegion: estabelecimento.endereco.estado,
      postalCode: estabelecimento.endereco.cep ?? undefined,
      addressCountry: 'BR',
    },
    geo:
      estabelecimento.latitude && estabelecimento.longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: estabelecimento.latitude,
            longitude: estabelecimento.longitude,
          }
        : undefined,
    telephone: estabelecimento.contato.telefone ?? undefined,
    url: estabelecimento.contato.site ?? undefined,
    currenciesAccepted: [...new Set(estabelecimento.pagamentos.map((p) => p.cripto))].join(', '),
    paymentAccepted: estabelecimento.pagamentos.map(
      (p) => `${p.cripto} (${descreverPagamento(p)})`,
    ),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD e conteudo proprio, serializado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-muted text-sm">
        <Link href="/estabelecimentos" className="hover:text-foreground">
          ← Todos os lugares
        </Link>
      </nav>

      <header className="space-y-3">
        <p className="text-muted text-sm">
          {rotulos.categoria[estabelecimento.categoria as keyof typeof rotulos.categoria]} ·{' '}
          {estabelecimento.bairro}
          {preco ? ` · ${preco.texto}` : ''}
        </p>
        <h1 className="font-display text-4xl leading-tight">{estabelecimento.nome}</h1>
        <VerificationBadge
          status={estabelecimento.verificacao.status}
          confirmadoEm={confirmadoEm}
          tamanho="md"
        />
      </header>

      {estabelecimento.fotos.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {estabelecimento.fotos.map((foto) => (
            <div key={foto.url} className="relative aspect-[3/2] overflow-hidden rounded-card">
              <Image
                src={foto.url}
                alt={foto.alt ?? estabelecimento.nome}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {estabelecimento.descricao ? (
        <p className="mt-8 text-lg leading-relaxed">{estabelecimento.descricao}</p>
      ) : null}

      <section className="mt-10">
        <h2 className="font-semibold text-xl">Como pagar em cripto</h2>

        {estabelecimento.pagamentos.length === 0 ? (
          <p className="mt-3 text-muted">Nenhuma forma de pagamento registrada ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {estabelecimento.pagamentos.map((pagamento) => (
              <li
                key={`${pagamento.cripto}-${pagamento.metodo}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {pagamento.cripto}{' '}
                    <span className="font-normal text-muted">
                      · {descreverPagamento(pagamento)}
                    </span>
                  </p>
                  <p className="text-muted text-sm">
                    {rotulos.custodia[pagamento.custodia as keyof typeof rotulos.custodia]}
                    {pagamento.observacao ? ` · ${pagamento.observacao}` : ''}
                  </p>
                </div>
                <VerificationBadge
                  status={estabelecimento.verificacao.status}
                  confirmadoEm={pagamento.confirmadoEm}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-semibold text-xl">Endereço</h2>
          <p className="mt-3 text-muted">{enderecoEmLinha(estabelecimento.endereco)}</p>
          <a
            href={urlComoChegar(estabelecimento)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-control bg-primary px-4 py-2 font-medium text-sm text-white hover:bg-primary-hover"
          >
            Como chegar
          </a>
        </div>

        <div>
          <h2 className="font-semibold text-xl">Contato</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {estabelecimento.contato.telefone ? (
              <li>
                <a href={`tel:${estabelecimento.contato.telefone}`} className="hover:text-primary">
                  {estabelecimento.contato.telefone}
                </a>
              </li>
            ) : null}
            {estabelecimento.contato.site ? (
              <li>
                <a
                  href={estabelecimento.contato.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Site
                </a>
              </li>
            ) : null}
            {estabelecimento.contato.instagram ? (
              <li>
                <a
                  href={estabelecimento.contato.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Instagram
                </a>
              </li>
            ) : null}
            {estabelecimento.contato.cardapio ? (
              <li>
                <a
                  href={estabelecimento.contato.cardapio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Cardápio
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </section>

      {horarios.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-semibold text-xl">Horário</h2>
          <dl className="mt-3 divide-y divide-border overflow-hidden rounded-card border border-border bg-surface text-sm">
            {horarios.map((dia) => (
              <div key={dia.nome} className="flex justify-between gap-4 px-4 py-2">
                <dt className="text-muted">{dia.nome}</dt>
                <dd>{dia.texto}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-10 rounded-card border border-border border-dashed bg-surface p-5 text-sm">
        <p className="text-muted">
          Alguma informação está errada ou desatualizada?{' '}
          <Link
            href={`/sugerir?tipo=reporte_erro&estabelecimento=${estabelecimento.slug}`}
            className="text-primary hover:underline"
          >
            Reportar um erro
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
