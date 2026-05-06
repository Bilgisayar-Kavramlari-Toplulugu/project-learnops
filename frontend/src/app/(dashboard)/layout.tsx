"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useProfile } from "@/hooks/profile/use-profile";
import { DashboardErrorState } from "@/components/ui";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile();

  // Only block render on a definitive auth failure, not while loading.
  // This lets the shell and server-rendered page content appear immediately,
  // reducing the element render delay and moving LCP to the static h1.
  if (!isLoading && !profile) return <DashboardErrorState />;

  return (
    <DashboardShell user={profile} sidebarItems={dashboardSidebarItems} activePath={pathname}>
      {children}
    </DashboardShell>
  );
}
