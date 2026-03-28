// hooks/use-profile.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardProfile } from "@/types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<DashboardProfile>("/users/me");
      return res.data;
    },
  });
}
