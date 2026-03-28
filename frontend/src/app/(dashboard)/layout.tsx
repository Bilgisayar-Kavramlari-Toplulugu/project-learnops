"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useProfile } from "@/hooks/profile/use-profile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) return null;

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
