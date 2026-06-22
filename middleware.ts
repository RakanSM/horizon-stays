import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export const config = {
  // Exclude api, _next, _vercel, admin, and static files from i18n locale routing
  matcher: ['/((?!api|_next|_vercel|admin|admin-login|.*\\..*).*)'],
};
