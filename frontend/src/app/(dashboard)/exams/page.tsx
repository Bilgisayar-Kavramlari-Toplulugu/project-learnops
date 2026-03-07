"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { routes } from "@/lib/routes";
import { StarterCanvas } from "@/components/dashboard/starter-canvas";
import { dashboardStarterUser } from "@/lib/dashboard-starter.config";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";

export default function ExamsPage() {
  return (
    <DashboardShell
      user={dashboardStarterUser}
      sidebarItems={dashboardSidebarItems}
      activePath={routes.exams}
    >
      <StarterCanvas
        title="Sinavlar"
        description="Sinav takvimi ve sonuc kartlari bu ekranda goruntulenir."
      />
    </DashboardShell>
  );
}
