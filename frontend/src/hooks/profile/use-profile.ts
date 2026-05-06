import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardProfile } from "@/types";

interface UseProfileOptions {
  initialData?: DashboardProfile;
}

export function useProfile({ initialData }: UseProfileOptions = {}) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<DashboardProfile>("/users/me");
      return res.data;
    },
    initialData,
  });
}
