import Image from 'next/image';
import Link from 'next/link';
import { Navegacao } from '@/components/registro/navegacao';
import { Calcada } from '@/components/registro/ui';
import { NAVEGACAO, REDES } from '@/lib/site';

/**
 * Cabecalho e rodape do site publico. Ficam neste grupo de rotas, nao no
 * layout raiz, para que o painel (/admin) tenha a propria moldura.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-papel">
      <header className="sticky top-0 z-[1100] bg-papel">
        <div className="mx-auto flex max-w-[1140px] flex-wrap items-end justify-between gap-5 px-7 pt-3.5 pb-3">
          <Link
            href="/"
            className="flex items-center gap-[11px] text-tinta hover:text-tinta hover:no-underline"
          >
            <Image
              src="/marca.svg"
              alt=""
              width={32}
              height={32}
              className="block rounded-[3px]"
              priority
            />
            <span className="flex flex-col gap-px">
              <span className="font-display font-medium text-[22px] leading-none tracking-[-0.01em]">
                CriptoCuritiba
              </span>
              <span className="font-mono text-[9.5px] text-tinta-fraca uppercase tracking-[0.18em]">
                Curitiba · Paraná
              </span>
            </span>
          </Link>

          <Navegacao />
        </div>
        <div className="h-[3px] bg-tinta" />
        <Calcada />
        <div className="h-px bg-tinta" />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto bg-pinheiro">
        <Calcada />
        <div className="mx-auto grid max-w-[1140px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 px-7 py-12">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <Image
                src="/marca.svg"
                alt=""
                width={26}
                height={26}
                className="block rounded-[3px]"
              />
              <span className="font-display font-medium text-[19px] text-papel">
                CriptoCuritiba
              </span>
            </div>
            <p className="m-0 max-w-[230px] text-[#9fb0a6] text-[13.5px] leading-[1.65]">
              Registro comunitário dos lugares que aceitam cripto em Curitiba.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-bold font-mono text-[#7d9188] text-[10px] uppercase tracking-[0.18em]">
              Navegar
            </span>
            {NAVEGACAO.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[#dfe5e0] text-[14px] hover:text-ocre hover:no-underline"
              >
                {item.rotulo}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-bold font-mono text-[#7d9188] text-[10px] uppercase tracking-[0.18em]">
              Comunidade
            </span>
            {REDES.map((rede) =>
              rede.url ? (
                <a
                  key={rede.rotulo}
                  href={rede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#dfe5e0] text-[14px] hover:text-ocre hover:no-underline"
                >
                  {rede.rotulo}
                </a>
              ) : (
                <span key={rede.rotulo} className="text-[#dfe5e0] text-[14px]">
                  {rede.rotulo}
                </span>
              ),
            )}
            <Link
              href="/privacidade"
              className="text-[#dfe5e0] text-[14px] hover:text-ocre hover:no-underline"
            >
              Privacidade
            </Link>
          </div>
        </div>
        <div className="border-[rgba(239,233,221,0.18)] border-t px-7 py-[18px] text-center font-mono text-[#8fa398] text-[10px] leading-[1.7] tracking-[0.1em]">
          © {new Date().getFullYear()} CriptoCuritiba · não intermedia pagamentos nem custodia
          cripto — apenas indica locais
        </div>
      </footer>
    </div>
  );
}
