import type { Metadata } from 'next';
import { Cornija, FotoPlaceholder, Rotulo } from '@/components/registro/ui';
import { dataParaIso, POSTS } from '@/lib/caderno';
import { SITE_URL as siteUrl } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Caderno — notícias da cena cripto em Curitiba',
  description: 'Notícias, guias e histórias da cena cripto de Curitiba.',
  alternates: { canonical: '/caderno' },
};

export default function CadernoPage() {
  const [capa, ...demais] = POSTS;

  // Sem rota de post individual ainda (ver lib/caderno.ts), entao o JSON-LD
  // descreve o Blog como um todo: cada item aponta para /caderno, nao para
  // uma URL propria.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Caderno da cidade — CriptoCuritiba',
    url: `${siteUrl}/caderno`,
    inLanguage: 'pt-BR',
    blogPost: POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.titulo,
      description: post.resumo,
      datePublished: dataParaIso(post.data),
      url: `${siteUrl}/caderno`,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-[1140px] animate-entrada px-7 pt-11 pb-[84px]">
      {/* JSON-LD para o Google e IA entenderem o conteudo do caderno. */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(jsonLd)}
      </script>

      <Rotulo className="mb-2.5">Caderno da cidade · edição corrente</Rotulo>
      <h1 className="mt-0 mb-4 font-display font-medium text-[clamp(32px,5vw,50px)] leading-none">
        Notícias da cena cripto em Curitiba
      </h1>
      <Cornija className="mb-[30px]" />

      {capa ? (
        <article className="mb-[38px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[34px]">
          <FotoPlaceholder
            rotulo={`[ ${capa.rotuloImagem} ]`}
            className="h-[280px] border border-regua"
          />
          <div className="flex flex-col justify-center gap-3">
            <span className="font-bold font-mono text-[10px] text-ocre-escuro uppercase tracking-[0.18em]">
              {capa.tag}
            </span>
            <h2 className="m-0 font-display font-medium text-[clamp(26px,3.4vw,36px)] leading-[1.08]">
              {capa.titulo}
            </h2>
            <p className="m-0 text-[15.5px] text-tinta-suave leading-[1.65]">{capa.resumo}</p>
            <span className="font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.14em]">
              {capa.data}
            </span>
          </div>
        </article>
      ) : null}

      <div className="flex flex-col border-tinta border-t">
        {demais.map((post) => (
          <article
            key={post.titulo}
            className="grid grid-cols-1 items-start gap-5 border-regua border-b py-[22px] md:grid-cols-3"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-bold font-mono text-[10px] text-ocre-escuro uppercase tracking-[0.18em]">
                {post.tag}
              </span>
              <span className="font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.14em]">
                {post.data}
              </span>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <h3 className="m-0 font-display font-medium text-[23px] leading-[1.18]">
                {post.titulo}
              </h3>
              <p className="m-0 text-[14.5px] text-tinta-media leading-[1.6]">{post.resumo}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
