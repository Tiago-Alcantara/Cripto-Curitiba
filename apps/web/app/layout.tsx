import type { Metadata } from 'next';
import { Archivo, Bodoni_Moda, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE_URL as siteUrl } from '@/lib/env';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-bodoni',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
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
    <html lang="pt-BR" className={`${archivo.variable} ${bodoni.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
