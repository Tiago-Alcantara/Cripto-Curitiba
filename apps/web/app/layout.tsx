import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Cripto Curitiba — onde gastar criptomoedas em Curitiba',
    template: '%s · Cripto Curitiba',
  },
  description:
    'Diretório curado de restaurantes, cafés, bares e lojas que aceitam criptomoedas em Curitiba, com selo de verificação e data da última confirmação.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Cripto Curitiba',
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-border border-b bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              Cripto<span className="text-primary">Curitiba</span>
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <Link href="/estabelecimentos" className="text-muted hover:text-foreground">
                Onde gastar
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
      </body>
    </html>
  );
}
