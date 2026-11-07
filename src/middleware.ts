// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Language Persistence: Redirect root based on cookie
  if (pathname === '/') {
    const localeCookie = request.cookies.get('NEXT_LOCALE');
    if (localeCookie?.value && localeCookie.value !== 'en' && ['fr', 'es', 'de', 'ar'].includes(localeCookie.value)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeCookie.value}`;
      return NextResponse.redirect(url, 302);
    }
  }

  // ... (keep existing admin & canonical www code) ...
  return NextResponse.next();
}