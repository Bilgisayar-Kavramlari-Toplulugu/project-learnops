import { type NextRequest, NextResponse } from "next/server";

// Runtime proxy: reads BACKEND_INTERNAL_URL at request time, not build time.
// This replaces the next.config.ts rewrite so the backend URL is never baked into the image.

const backendBase = () =>
  (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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
