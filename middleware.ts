import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['ar', 'en', 'fr', 'zh', 'es'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // For admin routes: pass through but inject pathname so layout can read it
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
