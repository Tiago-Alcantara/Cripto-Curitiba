import type { EstabelecimentoResumo } from '@cripto/shared';
import { rotulos } from '@cripto/shared';
import Image from 'next/image';
import Link from 'next/link';
import { confirmacaoMaisRecente, faixaPreco } from '@/lib/formatters';
import { CryptoChip } from './crypto-chip';
import { VerificationBadge } from './verification-badge';

export function EstablishmentCard({ estabelecimento }: { estabelecimento: EstabelecimentoResumo }) {
  const preco = faixaPreco(estabelecimento.faixaPreco);
  const confirmadoEm = confirmacaoMaisRecente(estabelecimento.pagamentos);

  return (
    <article className="group overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-primary/40">
      <Link href={`/estabelecimentos/${estabelecimento.slug}`} className="block">
        <div className="relative aspect-[3/2] w-full bg-background">
          {estabelecimento.fotoCapa ? (
            <Image
              src={estabelecimento.fotoCapa}
              alt={estabelecimento.nome}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center text-4xl text-border"
              aria-hidden
            >
              ◍
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary">
              {estabelecimento.nome}
            </h3>
            {preco ? (
              <span className="shrink-0 text-muted text-xs" title={preco.descricao}>
                <span className="sr-only">{preco.descricao}</span>
                <span aria-hidden>{preco.texto}</span>
              </span>
            ) : null}
          </div>

          <p className="text-muted text-sm">
            {rotulos.categoria[estabelecimento.categoria as keyof typeof rotulos.categoria]} ·{' '}
            {estabelecimento.bairro}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {estabelecimento.pagamentos.slice(0, 3).map((pagamento) => (
              <CryptoChip key={`${pagamento.cripto}-${pagamento.metodo}`} pagamento={pagamento} />
            ))}
            {estabelecimento.pagamentos.length > 3 ? (
              <span className="self-center text-muted text-xs">
                +{estabelecimento.pagamentos.length - 3}
              </span>
            ) : null}
          </div>

          <VerificationBadge
            status={estabelecimento.verificacao.status}
            confirmadoEm={confirmadoEm ?? estabelecimento.verificacao.em}
          />
        </div>
      </Link>
    </article>
  );
}
