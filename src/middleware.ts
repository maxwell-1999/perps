import { NextRequest, NextResponse } from 'next/server'

import { GeolocationCookie, IPAddressCookie } from './constants/cookies'

export function middleware(request: NextRequest) {
  const country = request.geo?.country
  const res = NextResponse.rewrite(request.nextUrl)
  const path = request.nextUrl.pathname
  if (path === '/') return NextResponse.redirect(request.nextUrl.origin + '/trade')

  res.cookies.set(GeolocationCookie, country || 'unknown')
  res.cookies.set(IPAddressCookie, request.ip || '0.0.0.0')
  return res
}
