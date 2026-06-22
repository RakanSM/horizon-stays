import { getRequestConfig } from 'next-intl/server';

export const locales = ['ar', 'en', 'fr', 'zh', 'es'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  // Fall back to 'ar' for non-locale paths (admin, admin-login, api…)
  // instead of calling notFound() which would 404 those pages.
  const activeLocale = locale && locales.includes(locale as Locale) ? locale : 'ar';

  return {
    locale: activeLocale,
    messages: (await import(`./messages/${activeLocale}.json`)).default,
  };
});
