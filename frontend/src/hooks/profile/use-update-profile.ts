import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardProfile } from "@/types";

interface UpdateProfilePayload {
  display_name: string;
  bio: string;
  avatar_type: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch<DashboardProfile>("/users/me", payload, {
        headers: { "Content-Type": "application/json" },
      }),

    onSuccess: (res) => {
      queryClient.setQueryData(["profile"], res.data);
    },
  });
}
