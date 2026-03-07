import axios, { AxiosError } from "axios";
import { env } from "@/lib/env";

type ApiErrorBody = {
  message?: string;
  detail?: string;
};

export class ApiClientError extends Error {
  status: number | undefined;
  payload: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

const API_BASE_URL = env.nextPublicApiBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message =
      payload?.message ?? payload?.detail ?? error.message ?? "An unexpected API error occurred";

    return Promise.reject(new ApiClientError(message, status, payload));
  },
);
