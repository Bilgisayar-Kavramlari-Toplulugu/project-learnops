import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { fetchProfileServer } from "@/lib/fetchProfile";

const PUBLIC_COURSE_PAGE_PATTERN = /^\/courses(?:\/[^/]+)?$/;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const pathname = headerStore.get("x-learnops-path") ?? "";
  const isAuthenticated = Boolean(cookieStore.get("access_token"));
  const allowAnonymous = !isAuthenticated && PUBLIC_COURSE_PAGE_PATTERN.test(pathname);

  // Fetch profile server-side so the avatar is included in the initial HTML.
  // This eliminates the client-side GET /users/me from the LCP critical path.
  // Falls back to null (client-side refresh flow) if the access token is expired.
  const initialProfile = await fetchProfileServer();

  return (
    <DashboardLayoutClient initialProfile={initialProfile} allowAnonymous={allowAnonymous}>
      {children}
    </DashboardLayoutClient>
  );
}
