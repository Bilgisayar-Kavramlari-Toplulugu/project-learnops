import { cookies } from "next/headers";
import type { DashboardProfile } from "@/types";

const backendBase = () =>
  (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Server-side profile fetch. Forwards the browser's auth cookies directly
 * to the backend so the profile is available in the initial HTML without
 * a client-side API call — eliminating the avatar as the LCP element.
 *
 * Returns null if the token is missing or expired (client-side refresh
 * interceptor will handle re-auth transparently).
 */
export async function fetchProfileServer(): Promise<DashboardProfile | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${backendBase()}/v1/users/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json() as Promise<DashboardProfile>;
  } catch {
    return null;
  }
}
