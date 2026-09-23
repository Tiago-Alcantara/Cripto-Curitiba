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

// JSON-LD do site como um todo (WebSite + Organization), para o Google e
// para IA com busca entenderem do que se trata o dominio antes mesmo de
// abrir uma pagina de estabelecimento.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Cripto Curitiba',
      url: siteUrl,
      description:
        'Diretório curado de restaurantes, cafés, bares e lojas que aceitam criptomoedas em Curitiba, com selo de verificação e data da última confirmação.',
      inLanguage: 'pt-BR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/mapa?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'Cripto Curitiba',
      url: siteUrl,
      logo: `${siteUrl}/marca.svg`,
      areaServed: { '@type': 'City', name: 'Curitiba' },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${bodoni.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-foreground">
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify(jsonLd)}
        </script>
        {children}
      </body>
    </html>
  );
}
