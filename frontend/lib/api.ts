import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { refresh, logout } from "./auth";

const API_BASE = "/api";

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler;

  return () => {
    if (onAuthFailure === handler) onAuthFailure = null;
  };
}

function notifyAuthFailure() {
  try {
    onAuthFailure?.();
  } catch {}
}

function isRefreshRequest(config?: AxiosRequestConfig) {
  const url = config?.url ?? "";
  return (
    url.includes("/auth/refresh") ||
    url === "/auth/refresh" ||
    url === "/refresh" ||
    url === "refresh"
  );
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let refreshPromise: Promise<AxiosResponse> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;

    if (!status) return Promise.reject(err);

    if (status !== 401) return Promise.reject(err);

    const originalConfig = err.config as RetriableConfig | undefined;
    if (!originalConfig) return Promise.reject(err);

    if (isRefreshRequest(originalConfig)) {
      await logout();
      notifyAuthFailure();
      return Promise.reject(err);
    }

    if (originalConfig._retry) {
      await logout();
      notifyAuthFailure();
      return Promise.reject(err);
    }
    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refresh().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      return api(originalConfig);
    } catch (refreshErr) {
      await logout();
      notifyAuthFailure();
      return Promise.reject(refreshErr);
    }
  },
);
