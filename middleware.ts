import createMiddleware from 'next-intl/middleware';
export default createMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed'  // AR at root, others prefixed
});
export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)']
};
