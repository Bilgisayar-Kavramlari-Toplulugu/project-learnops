import { NextResponse, type NextRequest } from "next/server";

// Authenticated user / veya /login'e gelirse dashboard'a fırlat
// Aynı zamanda bunlar exact public path'ler
const AUTH_REDIRECT_PATHS: readonly string[] = ["/", "/login"];
const PUBLIC_PREFIXES: readonly string[] = ["/courses"];

const PROTECTED_COURSE_PATTERN = /^\/courses\/[^/]+\/[^/]+/;

function isPublicPath(pathname: string): boolean {
  if (PROTECTED_COURSE_PATTERN.test(pathname)) return false;

  if (AUTH_REDIRECT_PATHS.includes(pathname)) return true;

  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token");

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  if (AUTH_REDIRECT_PATHS.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath(pathname) && !token) {
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
