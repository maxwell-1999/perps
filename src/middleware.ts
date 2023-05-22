import { NextRequest, NextResponse } from 'next/server'

import { GeolocationCookie } from './constants/cookies'

export function middleware(request: NextRequest) {
  const country = request.geo?.country
  const res = NextResponse.rewrite(request.nextUrl)
  const path = request.nextUrl.pathname
  if (path === '/') return NextResponse.redirect(request.nextUrl.origin + '/trade')
  if (country) {
    res.cookies.set(GeolocationCookie, country)
  }
  return res
}
