export type AuthProvider = "google" | "github" | "linkedin";

export interface AuthActionResponse {
  message: string;
  accessToken?: string;
  provider?: AuthProvider;
  mode: "mock" | "live";
}
