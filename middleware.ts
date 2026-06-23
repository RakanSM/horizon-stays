import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const intlMiddleware = createIntlMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Refresh Supabase session cookie on every request (admin routes only)
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    const supabase = createMiddlewareClient({ req, res });
    await supabase.auth.getSession();
    return res;
  }

  // Run i18n middleware for all other routes
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
