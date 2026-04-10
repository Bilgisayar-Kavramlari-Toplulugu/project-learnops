import axios from "axios";
import { useCallback } from "react";
import { API_BASE } from "./constants";
import { routes } from "./routes";

export type OAuthProvider = "google" | "github" | "linkedin";

const authClient = axios.create({
  baseURL: `${API_BASE}/auth`,
  withCredentials: true,
});

export function startOAuth(provider: OAuthProvider) {
  window.location.href = `${API_BASE}/auth/${provider}/login`;
}

export async function refresh() {
  return authClient.post("/refresh");
}

export async function logout() {
  try {
    await authClient.post("/logout");
  } catch {}
}

export function useAuth() {
  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    startOAuth(provider);
  }, []);

  const logoutAndRedirect = useCallback(async () => {
    await logout();
    window.location.href = routes.login;
  }, []);

  return {
    loginWithOAuth,
    refreshSession: refresh,
    logout: logoutAndRedirect,
  };
}