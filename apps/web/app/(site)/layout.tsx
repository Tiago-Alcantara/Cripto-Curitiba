import Link from 'next/link';

/**
 * Cabecalho e rodape do site publico. Ficam neste grupo de rotas, nao no
 * layout raiz, para que o painel (/admin) tenha a propria moldura.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Cripto<span className="text-primary">Curitiba</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/estabelecimentos" className="text-muted hover:text-foreground">
              Onde gastar
            </Link>
            <Link href="/mapa" className="text-muted hover:text-foreground">
              Mapa
            </Link>
            <Link href="/sobre" className="text-muted hover:text-foreground">
              Sobre
            </Link>
            <Link
              href="/sugerir"
              className="rounded-control bg-primary px-3 py-1.5 font-medium text-white hover:bg-primary-hover"
            >
              Sugerir local
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-border border-t bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-muted text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>Cripto Curitiba · diretório independente, sem intermediar pagamentos.</p>
          <div className="flex gap-4">
            <Link href="/sobre" className="hover:text-foreground">
              Como verificamos
            </Link>
            <Link href="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
