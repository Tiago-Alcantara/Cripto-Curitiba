import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import './globals.css';
import { SITE_URL as siteUrl } from '@/lib/env';

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
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
