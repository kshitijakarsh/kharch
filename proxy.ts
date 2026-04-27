import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!userId && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
};
