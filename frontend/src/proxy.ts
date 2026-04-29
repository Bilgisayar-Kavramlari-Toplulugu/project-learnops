import { NextResponse, NextRequest } from "next/server";

const STATIC_FILE_PATTERN = /\.[^/]+$/;

// Sadece bunlar — login varsa dashboard'a fırlat
const AUTH_REDIRECT_PATHS = ["/", "/login"];

// Public exact match
const PUBLIC_EXACT = ["/", "/login"];

// Public prefix match (ör: /courses, /courses/linux-temelleri)
const PUBLIC_PREFIXES = ["/courses"];

// Ama /courses/[slug]/[sectionId] korumalı
const PROTECTED_COURSE_PATTERN = /^\/courses\/[^/]+\/[^/]+/;

function isPublic(pathname: string): boolean {
  // Önce protected pattern kontrolü (öncelikli)
  if (PROTECTED_COURSE_PATTERN.test(pathname)) return false;

  // Exact match
  if (PUBLIC_EXACT.includes(pathname)) return true;

  // Prefix match (/courses ve /courses/...)
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token");

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    STATIC_FILE_PATTERN.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Authenticated user / veya /login'e gelirse dashboard'a fırlat
  if (AUTH_REDIRECT_PATHS.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public olmayan path + token yoksa login'e fırlat
  if (!isPublic(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-learnops-path", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
