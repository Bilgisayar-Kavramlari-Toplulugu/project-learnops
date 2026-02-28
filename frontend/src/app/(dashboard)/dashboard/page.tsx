"use client";

import { DashboardShell } from "@/shared/components/layout/dashboard-shell";
import { routes } from "@/shared/lib/config/routes";
import { HomeWelcomeCard } from "@/modules/dashboard/components/home-welcome-card";
import { dashboardSidebarItems } from "@/modules/dashboard/config/dashboard-ui.config";
import {
  dashboardStarterNotifications,
  dashboardStarterUser,
  dashboardStarterWorkspaces,
} from "@/modules/dashboard/config/dashboard-starter.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function DashboardPage() {
  return (
    <DashboardShell
      user={dashboardStarterUser}
      sidebarItems={dashboardSidebarItems}
      activePath={routes.dashboard}
      workspaces={dashboardStarterWorkspaces}
      activeWorkspaceId=""
      notifications={dashboardStarterNotifications}
    >
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <HomeWelcomeCard userName={dashboardStarterUser.name} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-blue-100/80 bg-white/82 shadow-lg shadow-blue-100/35 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Moduler Alan 01
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Bu blok backendden gelen ilk veri grubu icin ayrildi.</p>
              <p className="rounded-xl border border-dashed border-blue-200/90 px-3 py-3 text-xs dark:border-slate-700">
                Placeholder: kurs ilerleme, ozet metrikler veya feed.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100/80 bg-white/82 shadow-lg shadow-blue-100/35 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Moduler Alan 02
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Ikinci blok action veya bildirim odakli icerikler icin ayrildi.</p>
              <p className="rounded-xl border border-dashed border-blue-200/90 px-3 py-3 text-xs dark:border-slate-700">
                Placeholder: sinavlar, son aktiviteler veya quick actions.
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-100/80 bg-white/82 shadow-lg shadow-blue-100/35 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Moduler Alan 02
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Ikinci blok action veya bildirim odakli icerikler icin ayrildi.</p>
              <p className="rounded-xl border border-dashed border-blue-200/90 px-3 py-3 text-xs dark:border-slate-700">
                Placeholder: sinavlar, son aktiviteler veya quick actions.
              </p>
            </CardContent>
          </Card>
          
        </div>
      </section>
    </DashboardShell>
  );
}
