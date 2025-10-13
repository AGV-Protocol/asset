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

  // Check for admin routes that need authentication
  const isAdminRoute = pathname.includes('/admin');
  
  if (isAdminRoute) {
    // Check if user has authentication token
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      // Redirect to login page (we'll create this)
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Get locale from cookie or default to English
    const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
    
    // Redirect to the same pathname with locale
    const url = new URL(`/${locale}${pathname}`, request.url);
    const response = NextResponse.redirect(url);
    
    // Set/update the locale cookie
    response.cookies.set('NEXT_LOCALE', locale, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
    
    return response;
  }

  return NextResponse.next();
}

