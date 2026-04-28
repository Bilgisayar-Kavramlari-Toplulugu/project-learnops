import { api } from "@/lib/api";
import type { DashboardSummaryResponse } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const { data } = await api.get<DashboardSummaryResponse>("/dashboard/summary/");
  return data;
}
