import { Chrome, Github, Linkedin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AuthProvider } from "@/modules/auth/types/auth.types";

interface AuthProviderOption {
  key: AuthProvider;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const authProviderOptions: AuthProviderOption[] = [
  {
    key: "google",
    label: "Google ile Devam Et",
    description: "Google OAuth",
    icon: Chrome,
  },
  {
    key: "github",
    label: "GitHub ile Devam Et",
    description: "GitHub OAuth",
    icon: Github,
  },
  {
    key: "linkedin",
    label: "LinkedIn ile Devam Et",
    description: "LinkedIn OAuth",
    icon: Linkedin,
  },
];

export const providerDisplayNames: Record<AuthProvider, string> = {
  google: "Google",
  github: "GitHub",
  linkedin: "LinkedIn",
};
