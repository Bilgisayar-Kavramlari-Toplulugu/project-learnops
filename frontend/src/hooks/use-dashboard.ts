"use client";

import { dashboardStarterOverview } from "@/lib/dashboard-starter.config";
import { mapDashboardOverviewToScreenData } from "@/lib/dashboard.mapper";

export function useDashboardScreenData() {
  const data = mapDashboardOverviewToScreenData(dashboardStarterOverview);

  return {
    data,
    isLoading: false,
    isFetching: false,
    hasAnyError: false,
    isUsingFallback: true,
  };
}
