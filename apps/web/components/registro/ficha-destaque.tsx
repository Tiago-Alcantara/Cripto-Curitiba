import type { EstabelecimentoResumo } from '@cripto/shared';
import Image from 'next/image';
import Link from 'next/link';
import { confirmacaoMaisRecente } from '@/lib/formatters';
import { rotuloCategoria, rotulosCripto } from '@/lib/registro';
import { FotoPlaceholder, Selo, TagCripto } from './ui';

/** Ficha de local em destaque: barra lateral verde, № de registro, selo e criptos. */
export function FichaDestaque({
  estabelecimento,
  numero,
}: {
  estabelecimento: EstabelecimentoResumo;
  numero?: string;
}) {
  return (
    <article className="flex flex-col rounded-[2px] border border-regua border-l-4 border-l-verde bg-papel-claro">
      <Link
        href={`/estabelecimentos/${estabelecimento.slug}`}
        className="flex flex-1 flex-col text-tinta hover:text-tinta hover:no-underline"
      >
        {estabelecimento.fotoCapa ? (
          <div className="relative h-28 border-regua border-b">
            <Image
              src={estabelecimento.fotoCapa}
              alt={estabelecimento.nome}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <FotoPlaceholder rotulo="[ foto da fachada ]" className="h-28 border-regua border-b" />
        )}

        <div className="flex flex-1 flex-col gap-[9px] px-[18px] pt-4 pb-[18px]">
          <div className="flex gap-2 font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.14em]">
            {numero ? <span>№ {numero}</span> : null}
            <span>{estabelecimento.bairro}</span>
          </div>
          <h3 className="m-0 font-display font-medium text-[21px] leading-[1.15]">
            {estabelecimento.nome}
          </h3>
          <p className="m-0 text-[13px] text-tinta-media">
            {rotuloCategoria(estabelecimento.categoria)}
          </p>
          <Selo
            status={estabelecimento.verificacao.status}
            confirmadoEm={
              confirmacaoMaisRecente(estabelecimento.pagamentos) ?? estabelecimento.verificacao.em
            }
            tamanho="md"
          />
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {rotulosCripto(estabelecimento.pagamentos).map((rotulo) => (
              <TagCripto key={rotulo}>{rotulo}</TagCripto>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
