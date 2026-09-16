import type { MetadataRoute } from 'next';
import { listarPublicados, tolerante } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicados = await tolerante(listarPublicados(), []);

  const fixas: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/estabelecimentos`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/sugerir`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/sobre`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [
    ...fixas,
    ...publicados.map(({ slug, atualizadoEm }) => ({
      url: `${siteUrl}/estabelecimentos/${slug}`,
      lastModified: new Date(atualizadoEm),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
