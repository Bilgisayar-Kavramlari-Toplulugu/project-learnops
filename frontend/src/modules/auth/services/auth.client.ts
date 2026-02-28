import { apiClient } from "@/shared/lib/api/client";

class AuthClient {
  async post<TResponse, TPayload>(path: string, payload: TPayload) {
    const response = await apiClient.post<TResponse>(path, payload);
    return response.data;
  }
}

export const authClient = new AuthClient();
