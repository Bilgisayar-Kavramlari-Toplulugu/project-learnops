import { type NextRequest, NextResponse } from "next/server";

// Runtime proxy: reads BACKEND_INTERNAL_URL at request time, not build time.
// This replaces the next.config.ts rewrite so the backend URL is never baked into the image.

const backendBase = () =>
  (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendUrl = `${backendBase()}/v1/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    // @ts-expect-error -- Node.js fetch duplex requirement
    duplex: "half",
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  // Let Next.js handle its own encoding
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  // For OAuth redirect responses (302/303) that carry Set-Cookie headers,
  // Next.js App Router route handlers silently drop Set-Cookie on redirect
  // responses. To ensure auth cookies reach the browser, we rewrite the
  // redirect as a 200 HTML response that immediately meta-refreshes to the
  // Location URL, while keeping all Set-Cookie headers intact.
  if (
    (response.status === 302 || response.status === 303) &&
    response.headers.has("location") &&
    response.headers.has("set-cookie")
  ) {
    const location = response.headers.get("location")!;
    const nextResponse = new NextResponse(
      `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${location}"></head><body></body></html>`,
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
    );
    // Copy all Set-Cookie headers
    response.headers.getSetCookie?.().forEach((cookie) => {
      nextResponse.headers.append("set-cookie", cookie);
    });
    return nextResponse;
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
