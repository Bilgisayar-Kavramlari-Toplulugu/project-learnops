"use client";

import { DashboardShell } from "@/shared/components/layout/dashboard-shell";
import { routes } from "@/shared/lib/config/routes";
import { StarterCanvas } from "@/modules/dashboard/components/starter-canvas";
import {
  dashboardStarterNotifications,
  dashboardStarterUser,
  dashboardStarterWorkspaces,
} from "@/modules/dashboard/config/dashboard-starter.config";
import { dashboardSidebarItems } from "@/modules/dashboard/config/dashboard-ui.config";

export default function ExamsPage() {
  return (
    <DashboardShell
      user={dashboardStarterUser}
      sidebarItems={dashboardSidebarItems}
      activePath={routes.exams}
      workspaces={dashboardStarterWorkspaces}
      activeWorkspaceId=""
      notifications={dashboardStarterNotifications}
    >
      <StarterCanvas
        title="Sinavlar"
        description="Sinav takvimi ve sonuc kartlari backend endpointleri baglandiginda bu alana eklenecek."
      />
    </DashboardShell>
  );
}
