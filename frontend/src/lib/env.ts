const DEFAULT_API_BASE_URL = "/api";

function withDefault(value: string | undefined, fallback: string) {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

export const env = {
  nextPublicApiBaseUrl: withDefault(process.env.NEXT_PUBLIC_API_BASE_URL, DEFAULT_API_BASE_URL),
  backendInternalUrl: process.env.BACKEND_INTERNAL_URL,
};
