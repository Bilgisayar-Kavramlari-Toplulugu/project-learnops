import { providerDisplayNames } from "@/modules/auth/constants/providers";
import type { AuthActionResponse, AuthProvider } from "@/modules/auth/types/auth.types";
import { env } from "@/shared/lib/config/env";
import { authClient } from "./auth.client";

const USE_MOCK_AUTH = env.nextPublicUseMockAuth;

const authEndpoints = {
  provider: (provider: AuthProvider) => `/auth/providers/${provider}`,
} as const;

function withLatency<T>(value: T, delayMs = 500) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), delayMs);
  });
}

export async function loginWithProvider(provider: AuthProvider): Promise<AuthActionResponse> {
  if (USE_MOCK_AUTH) {
    return withLatency({
      message: `${providerDisplayNames[provider]} ile giris tiklandi. OAuth redirect backendde baglanacak.`,
      provider,
      mode: "mock",
    });
  }

  const response = await authClient.post<AuthActionResponse, Record<string, never>>(
    authEndpoints.provider(provider),
    {},
  );
  return {
    ...response,
    provider,
    mode: "live",
  };
}
