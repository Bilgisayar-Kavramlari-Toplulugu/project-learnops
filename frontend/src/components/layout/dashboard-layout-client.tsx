"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useProfile } from "@/hooks/profile/use-profile";
import { DashboardErrorState } from "@/components/ui";
import type { DashboardProfile } from "@/types";

interface DashboardLayoutClientProps {
  /** Profile pre-fetched server-side; null means access token was expired,
   *  fall back to client-side useProfile() which triggers the refresh flow. */
  initialProfile: DashboardProfile | null;
  allowAnonymous?: boolean;
  children: ReactNode;
}

export function DashboardLayoutClient({
  initialProfile,
  allowAnonymous = false,
  children,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile({
    initialData: initialProfile ?? undefined,
    enabled: !allowAnonymous,
  });

  if (!allowAnonymous && !isLoading && !profile) return <DashboardErrorState />;

  return (
    <DashboardShell user={profile} sidebarItems={dashboardSidebarItems} activePath={pathname}>
      {children}
    </DashboardShell>
  );
}
