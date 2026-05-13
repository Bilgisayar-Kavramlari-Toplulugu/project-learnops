"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AppFooter } from "@/components/layout/app-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useProfile } from "@/hooks/profile/use-profile";
import { DashboardErrorState } from "@/components/ui";
import { mergeAccounts } from "@/lib/auth";
import { LogoutGuardProvider } from "@/providers/logout-guard-provider";
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
  const mergeAttempted = useRef(false);

  useEffect(() => {
    if (mergeAttempted.current) return;

    const pendingToken = sessionStorage.getItem("pending_merge_token");
    if (!pendingToken) return;

    mergeAttempted.current = true;
    sessionStorage.removeItem("pending_merge_token");

    mergeAccounts(pendingToken).catch((err) => {
      // Merge başarısız olursa sessizce geç — kullanıcı zaten giriş yapmış durumda.
      // Token süresi dolmuş ya da daha önce kullanılmış olabilir.
      console.warn("[merge] Hesap birleştirme başarısız:", err?.response?.data?.detail ?? err);
    });
  }, []);

  if (!allowAnonymous && !isLoading && !profile) return <DashboardErrorState />;

  if (allowAnonymous) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col gap-8 px-5 py-4 lg:px-8">
          <SiteHeader />
          <main className="min-h-0 flex-1">{children}</main>
          <AppFooter />
        </div>
      </div>
    );
  }

  return (
    <LogoutGuardProvider>
      <DashboardShell user={profile} sidebarItems={dashboardSidebarItems} activePath={pathname}>
        {children}
      </DashboardShell>
    </LogoutGuardProvider>
  );
}
