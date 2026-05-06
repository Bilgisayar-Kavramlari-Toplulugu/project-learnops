import type { ReactNode } from "react";

import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { fetchProfileServer } from "@/lib/fetchProfile";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Fetch profile server-side so the avatar is included in the initial HTML.
  // This eliminates the client-side GET /users/me from the LCP critical path.
  // Falls back to null (client-side refresh flow) if the access token is expired.
  const initialProfile = await fetchProfileServer();

  return (
    <DashboardLayoutClient initialProfile={initialProfile}>
      {children}
    </DashboardLayoutClient>
  );
}
