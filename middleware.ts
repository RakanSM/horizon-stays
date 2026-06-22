import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — handle auth in middleware to avoid layout redirect loops
  if (pathname.startsWith('/admin')) {
    // Login page is always accessible
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // All other /admin/* routes require a valid session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() { /* read-only check, no cookie mutations needed */ },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // All other routes: apply i18n locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
