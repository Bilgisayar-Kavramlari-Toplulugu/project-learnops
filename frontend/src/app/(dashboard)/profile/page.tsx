"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StarterCanvas } from "@/components/dashboard/starter-canvas";
import { dashboardStarterUser } from "@/lib/dashboard-starter.config";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { routes } from "@/lib/routes";

export default function ProfilePage() {
  return (
    <DashboardShell
      user={dashboardStarterUser}
      sidebarItems={dashboardSidebarItems}
      activePath={routes.profile}
    >
      <StarterCanvas
        title="Profil"
        description="Profil detaylari bu ekranda goruntulenecek."
      />
    </DashboardShell>
  );
}
