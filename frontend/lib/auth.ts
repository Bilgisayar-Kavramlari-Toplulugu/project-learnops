import axios from "axios";

const API_BASE = "/api";

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
  async function logoutAndRedirect() {
    await logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return {
    loginWithOAuth: startOAuth,
    refreshSession: refresh,
    logout: logoutAndRedirect,
  };
}
