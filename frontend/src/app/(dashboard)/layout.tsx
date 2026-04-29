"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useProfile } from "@/hooks/profile/use-profile";
import { DashboardErrorState, DashboardShellSkeleton } from "@/components/ui";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <DashboardShellSkeleton />;
  if (!profile) return <DashboardErrorState />;

  return (
    <DashboardShell user={profile} sidebarItems={dashboardSidebarItems} activePath={pathname}>
      {children}
    </DashboardShell>
  );
}
