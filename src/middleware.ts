import { NextRequest, NextResponse } from 'next/server'

import { GeolocationCookie, IPAddressCookie } from './constants/cookies'

export function middleware(request: NextRequest) {
  const country = request.geo?.country
  const res = NextResponse.rewrite(request.nextUrl)
  const path = request.nextUrl.pathname
  if (path === '/' || path.startsWith('/ethereum')) return NextResponse.redirect(request.nextUrl.origin + '/trade')

  const splitPath = path.split('/')
  if (splitPath.length === 3 && ['trade', 'provide'].includes(splitPath[2]))
    return NextResponse.redirect(request.nextUrl.origin + `/${splitPath[2] === 'provide' ? 'earn' : 'trade'}`)

  res.cookies.set(GeolocationCookie, country || 'unknown')
  res.cookies.set(IPAddressCookie, request.ip || '0.0.0.0')
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - tradingview (tradingview widget files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|tradingview).*)',
  ],
}
