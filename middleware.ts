import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Admin routes handle authentication server-side; keep Edge middleware free
  // of Node-only Supabase dependencies so public and admin pages remain reachable.
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    return res;
  }

  // Run i18n middleware for all other routes
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
