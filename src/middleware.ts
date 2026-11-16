import { NextResponse, type NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, type Locale } from '@/config/i18n-registry';
import { localizePath, localeFromPath } from '@/locales/routing';
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookie = request.cookies.get('NEXT_LOCALE')?.value as Locale | undefined;
  const hasLocale = SUPPORTED_LOCALES.includes(pathname.split('/')[1] as Locale);
  if (!hasLocale && cookie && cookie !== 'en' && SUPPORTED_LOCALES.includes(cookie)) {
    const destination = localizePath(pathname, cookie);
    if (destination !== pathname) {
      const url = request.nextUrl.clone(); url.pathname = destination;
      return NextResponse.redirect(url, 307);
    }
  }
  const headers = new Headers(request.headers);
  headers.set('x-pdfconverter-locale', localeFromPath(pathname));
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
