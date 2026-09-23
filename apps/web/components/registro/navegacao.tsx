'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVEGACAO } from '@/lib/site';

function estaAtivo(caminho: string, href: string): boolean {
  if (href === '/') return caminho === '/';
  // A ficha de um local (/estabelecimentos/...) pertence ao Mapa.
  if (href === '/mapa' && caminho.startsWith('/estabelecimentos')) return true;
  return caminho === href || caminho.startsWith(`${href}/`);
}

/** Item ativo = sublinhado ocre de 2px; nada de pill (docs/05-design.md). */
export function Navegacao() {
  const caminho = usePathname();

  return (
    <nav aria-label="Principal" className="flex flex-wrap items-center gap-[22px] pb-[3px]">
      {NAVEGACAO.map((item) => {
        const ativo = estaAtivo(caminho, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? 'page' : undefined}
            className={`border-b-2 px-px py-[3px] text-[12px] uppercase tracking-[0.12em] hover:no-underline ${
              ativo
                ? 'border-ocre font-bold text-tinta hover:text-tinta'
                : 'border-transparent font-semibold text-tinta-fraca hover:border-regua hover:text-tinta'
            }`}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
