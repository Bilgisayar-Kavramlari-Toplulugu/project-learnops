"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useProfile } from "@/hooks/profile/use-profile";
import { DashboardShellSkeleton } from "@/components/ui/dashboardshell-skeleton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) return <DashboardShellSkeleton />;

  return (
    <DashboardShell
      user={profile}
      sidebarItems={dashboardSidebarItems}
      activePath={pathname}
    >
      {children}
      
    </DashboardShell>
  );
}
