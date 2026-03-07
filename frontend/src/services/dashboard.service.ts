import type { DashboardOverviewResponse } from "@/types/dashboard-api.types";
import { apiClient } from "@/lib/api-client";

const dashboardEndpoints = {
  summary: "/dashboard/summary",
} as const;

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const response = await apiClient.get<DashboardOverviewResponse>(dashboardEndpoints.summary);
  return response.data;
}
