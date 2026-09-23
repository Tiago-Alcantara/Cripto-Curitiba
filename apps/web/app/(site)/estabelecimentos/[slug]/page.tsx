import { rotulos } from '@cripto/shared';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapViewDinamico } from '@/components/map-view-dinamico';
import {
  Cornija,
  FotoPlaceholder,
  linkTexto,
  Rotulo,
  Selo,
  TagCripto,
} from '@/components/registro/ui';
import { buscarEstabelecimento, listarPublicados, tolerante } from '@/lib/api';
import {
  confirmacaoMaisRecente,
  descreverPagamento,
  enderecoEmLinha,
  faixaPreco,
  horariosParaSchema,
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
    image:
      estabelecimento.fotos.length > 0
        ? estabelecimento.fotos.map((foto) => foto.url)
        : (estabelecimento.fotoCapa ?? undefined),
    priceRange: preco?.texto,
    currenciesAccepted: [...new Set(estabelecimento.pagamentos.map((p) => p.cripto))].join(', '),
    paymentAccepted: estabelecimento.pagamentos.map(
      (p) => `${p.cripto} (${descreverPagamento(p)})`,
    ),
    openingHoursSpecification: horariosParaSchema(estabelecimento.horarios),
  };

  const numeroH2 = 'mt-0 mb-3.5 font-display font-medium text-[24px] leading-[1.1]';
  const contatos = [
    estabelecimento.contato.telefone
      ? {
          rotulo: estabelecimento.contato.telefone,
          href: `tel:${estabelecimento.contato.telefone}`,
        }
      : null,
    estabelecimento.contato.site ? { rotulo: 'Site', href: estabelecimento.contato.site } : null,
    estabelecimento.contato.instagram
      ? { rotulo: 'Instagram', href: estabelecimento.contato.instagram }
      : null,
    estabelecimento.contato.cardapio
      ? { rotulo: 'Cardápio', href: estabelecimento.contato.cardapio }
      : null,
  ].filter((item): item is { rotulo: string; href: string } => item !== null);

  return (
    <article className="mx-auto w-full max-w-[860px] animate-entrada px-7 pt-11 pb-[84px]">
      {/* JSON-LD para o Google entender o local; conteudo proprio, serializado. */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(jsonLd)}
      </script>

      <nav className="mb-6">
        <Link
          href="/mapa"
          className="font-bold text-[11.5px] text-verde uppercase tracking-[0.11em] hover:text-verde-escuro"
        >
          ← Voltar ao mapa
        </Link>
      </nav>

      <header>
        <Rotulo className="mb-2.5">
          {rotulos.categoria[estabelecimento.categoria as keyof typeof rotulos.categoria]} ·{' '}
          {estabelecimento.bairro}
          {preco ? ` · ${preco.texto}` : ''}
        </Rotulo>
        <h1 className="mt-0 mb-4 font-display font-medium text-[clamp(32px,5vw,50px)] leading-none">
          {estabelecimento.nome}
        </h1>
        <Selo
          status={estabelecimento.verificacao.status}
          confirmadoEm={confirmadoEm}
          tamanho="md"
        />
        <Cornija className="mt-6" />
      </header>

      {estabelecimento.fotos.length > 0 ? (
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
          {estabelecimento.fotos.map((foto) => (
            <div
              key={foto.url}
              className="relative aspect-[3/2] overflow-hidden rounded-[2px] border border-regua"
            >
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
      ) : (
        <FotoPlaceholder
          rotulo="[ foto da fachada ]"
          className="mt-8 h-[180px] border border-regua"
        />
      )}

      {estabelecimento.descricao ? (
        <p className="mt-8 mb-0 text-[16.5px] text-tinta-suave leading-[1.72]">
          {estabelecimento.descricao}
        </p>
      ) : null}

      <section className="mt-11">
        <h2 className={numeroH2}>Como pagar em cripto</h2>

        {estabelecimento.pagamentos.length === 0 ? (
          <p className="m-0 text-[15px] text-tinta-media">
            Nenhuma forma de pagamento registrada ainda.
          </p>
        ) : (
          <ul className="m-0 list-none border-tinta border-t p-0">
            {estabelecimento.pagamentos.map((pagamento) => (
              <li
                key={`${pagamento.cripto}-${pagamento.metodo}`}
                className="flex flex-wrap items-center justify-between gap-3 border-regua border-b py-3.5"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <TagCripto>{pagamento.cripto}</TagCripto>
                    <span className="text-[14.5px] text-tinta">
                      {descreverPagamento(pagamento)}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.12em]">
                    {rotulos.custodia[pagamento.custodia as keyof typeof rotulos.custodia]}
                    {pagamento.observacao ? ` · ${pagamento.observacao}` : ''}
                  </span>
                </div>
                <Selo
                  status={estabelecimento.verificacao.status}
                  confirmadoEm={pagamento.confirmadoEm}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {estabelecimento.latitude && estabelecimento.longitude ? (
        <section className="mt-11">
          <h2 className={numeroH2}>No mapa</h2>
          <div className="mx-auto max-w-[520px]">
            <MapViewDinamico
              estabelecimentos={[
                {
                  id: estabelecimento.id,
                  slug: estabelecimento.slug,
                  nome: estabelecimento.nome,
                  categoria: estabelecimento.categoria,
                  bairro: estabelecimento.bairro,
                  latitude: estabelecimento.latitude,
                  longitude: estabelecimento.longitude,
                  fotoCapa: estabelecimento.fotoCapa,
                  faixaPreco: estabelecimento.faixaPreco,
                  verificacao: estabelecimento.verificacao,
                  pagamentos: estabelecimento.pagamentos,
                },
              ]}
              selecionadoId={estabelecimento.id}
              enquadrarNosPins
            />
          </div>
        </section>
      ) : null}

      <section className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
        <div>
          <h2 className={numeroH2}>Endereço</h2>
          <p className="mt-0 mb-4 text-[15px] text-tinta-media leading-[1.6]">
            {enderecoEmLinha(estabelecimento.endereco)}
          </p>
          <a
            href={urlComoChegar(estabelecimento)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-[2px] bg-verde px-5 py-3 font-bold text-[12px] text-creme uppercase tracking-[0.11em] hover:bg-verde-escuro hover:text-creme hover:no-underline"
          >
            Como chegar
          </a>
        </div>

        {contatos.length > 0 ? (
          <div>
            <h2 className={numeroH2}>Contato</h2>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px]">
              {contatos.map((contato) => (
                <li key={contato.href}>
                  <a
                    href={contato.href}
                    target={contato.href.startsWith('tel:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className={linkTexto}
                  >
                    {contato.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {horarios.length > 0 ? (
        <section className="mt-11">
          <h2 className={numeroH2}>Horário</h2>
          <dl className="m-0 border-tinta border-t text-[14.5px]">
            {horarios.map((dia) => (
              <div
                key={dia.nome}
                className="flex justify-between gap-4 border-regua border-b py-2.5"
              >
                <dt className="font-mono text-[10.5px] text-tinta-fraca uppercase tracking-[0.12em]">
                  {dia.nome}
                </dt>
                <dd className="m-0">{dia.texto}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-11 rounded-[2px] border border-regua border-dashed bg-papel-claro px-5 py-4 text-[14.5px] text-tinta-media">
        Alguma informação está errada ou desatualizada?{' '}
        <Link
          href={`/indicar?tipo=reporte_erro&estabelecimento=${estabelecimento.slug}`}
          className={linkTexto}
        >
          Reportar um erro
        </Link>
        .
      </section>
    </article>
  );
}
