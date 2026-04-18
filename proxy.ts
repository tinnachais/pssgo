import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('pssgo_session');
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  const isPublicPage = request.nextUrl.pathname.startsWith('/liff') || request.nextUrl.pathname.startsWith('/visitor/preregister');
  
  // Protect routes: Redirect to login if no session is found and trying to access app
  if (!session && !isLoginPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Prevent accessing login page if already authenticated
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  // Apply proxy to all routes except api, _next, and standard public files
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}
