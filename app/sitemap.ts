import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ar', 'en', 'fr', 'zh', 'es'];
  const base = 'https://horizonstays.com';
  return [
    ...locales.map((locale) => ({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    })),
    ...locales.map((locale) => ({
      url: `${base}/${locale}/booking`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
