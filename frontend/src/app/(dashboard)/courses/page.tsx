"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { routes } from "@/lib/routes";
import { StarterCanvas } from "@/components/dashboard/starter-canvas";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { useUser } from "@/hooks/use-user";

export default function CoursesPage() {
  const { user, loading } = useUser();

  if (loading || !user) return null;

  return (
    <DashboardShell
      user={user}
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
