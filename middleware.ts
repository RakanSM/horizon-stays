import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // For admin routes: pass through but inject pathname so layout can detect login page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }
  // For all other routes: apply i18n locale routing
  return intlMiddleware(request);
}

export const config = {
  // Include /admin/* in matcher (handled above); exclude only api, _next, _vercel, static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
