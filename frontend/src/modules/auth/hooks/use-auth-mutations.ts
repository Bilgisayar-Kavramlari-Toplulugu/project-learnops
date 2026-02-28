"use client";

import { useMutation } from "@tanstack/react-query";

import type { AuthProvider } from "@/modules/auth/types/auth.types";
import { useAuth } from "@/shared/lib/useAuth";
import { loginWithProvider } from "@/modules/auth/services/auth.service";

export function useProviderLoginMutation() {
  const { loginWithToken } = useAuth();

  return useMutation({
    mutationFn: (provider: AuthProvider) => loginWithProvider(provider),
    onSuccess: async (data) => {
      if (!data.accessToken) {
        return;
      }

      await loginWithToken(data.accessToken);
    },
  });
}
