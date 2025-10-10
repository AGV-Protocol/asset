import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/'
  ]
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip static files
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Get locale from cookie or default to English
    const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
    
    // For root path, redirect to home page
    const targetPath = pathname === '/' ? `/${locale}/home` : `/${locale}${pathname}`;
    const url = new URL(targetPath, request.url);
    const response = NextResponse.redirect(url);
    
    // Set/update the locale cookie
    response.cookies.set('NEXT_LOCALE', locale, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
    
    return response;
  }

  // Handle locale-only paths (e.g., /en) - redirect to home
  const localeOnlyPath = locales.some(
    (locale) => pathname === `/${locale}`
  );

  if (localeOnlyPath) {
    const locale = pathname.split('/')[1];
    const url = new URL(`/${locale}/home`, request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
