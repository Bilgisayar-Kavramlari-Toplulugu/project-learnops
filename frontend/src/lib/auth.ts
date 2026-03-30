import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "./constants";
import { routes } from "./routes";
import type { User } from "../types";
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
async function getUserData(): Promise<User | null> {
  try {
    const response = await authClient.get("/me");
    return {
      display_name: response.data.display_name,
      avatar_type: response.data.avatar_type,
    };
  } catch {
    return null;
  }
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    startOAuth(provider);
  }, []);
  const fetchUser = useCallback(async () => {
    const data = await getUserData();
    setUser(data);
  }, []);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  const logoutAndRedirect = useCallback(async () => {
    await logout();
    window.location.href = routes.login;
  }, []);
  return {
    loginWithOAuth,
    refreshSession: refresh,
    logout: logoutAndRedirect,
    user,
  };
}
