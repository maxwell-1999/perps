import { NextRequest, NextResponse } from "next/server";
import { GEOLOCATION_COOKIE } from "./constants";

export function middleware(request: NextRequest) {
  const country = request.geo?.country;
  const res = NextResponse.rewrite(request.nextUrl);
  const path = request.nextUrl.pathname;
  if (path === "/") return NextResponse.redirect(request.nextUrl.origin + "/trade");
  if (country) {
    res.cookies.set(GEOLOCATION_COOKIE, country);
  }
  return res;
}
