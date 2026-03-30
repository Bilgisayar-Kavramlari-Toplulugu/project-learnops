"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StarterCanvas } from "@/components/dashboard/starter-canvas";
import { dashboardSidebarItems } from "@/lib/dashboard-ui.config";
import { routes } from "@/lib/routes";
import { useUser } from "@/hooks/use-user";

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading || !user) return null;

  return (
    
    <DashboardShell
      user={user}
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
  