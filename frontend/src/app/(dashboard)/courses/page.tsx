"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { routes } from "@/lib/routes";
import { StarterCanvas } from "@/components/dashboard/starter-canvas";
import { dashboardStarterUser } from "@/lib/dashboard-starter.config";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";

export default function CoursesPage() {
  return (
    <DashboardShell
      user={dashboardStarterUser}
      sidebarItems={dashboardSidebarItems}
      activePath={routes.courses}
    >
      <StarterCanvas
        title="Kurslar"
        description="Kurs listesi ve filtreler bu ekranda goruntulenir."
      />
    </DashboardShell>
  );
}
