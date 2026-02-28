import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { authProviderOptions } from "@/modules/auth/constants/providers";
import type { AuthProvider } from "@/modules/auth/types/auth.types";

interface ProviderAuthButtonsProps {
  onClick: (provider: AuthProvider) => void;
  pendingProvider: AuthProvider | null;
}

const providerIconTone: Record<AuthProvider, string> = {
  google: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  github: "bg-slate-100 text-slate-700 dark:bg-slate-700/70 dark:text-slate-100",
  linkedin: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

const providerButtonTone: Record<AuthProvider, string> = {
  google: "border-red-100/90 hover:bg-red-50/60 dark:border-red-500/20 dark:hover:bg-red-500/10",
  github: "border-slate-200/90 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
  linkedin: "border-sky-100/90 hover:bg-sky-50/60 dark:border-sky-500/20 dark:hover:bg-sky-500/10",
};

export function ProviderAuthButtons({ onClick, pendingProvider }: ProviderAuthButtonsProps) {
  return (
    <div className="grid gap-2.5">
      {authProviderOptions.map((provider) => {
        const Icon = provider.icon;
        const isPending = pendingProvider === provider.key;

        return (
          <Button
            key={provider.key}
            type="button"
            variant="outline"
            onClick={() => onClick(provider.key)}
            disabled={pendingProvider !== null}
            className={`h-11 justify-between rounded-2xl bg-white/92 px-3 text-slate-700 shadow-xs hover:text-slate-900 dark:bg-slate-900/92 dark:text-slate-200 ${providerButtonTone[provider.key]}`}
          >
            <span className="inline-flex items-center gap-2.5">
              <span
                className={`flex size-8 items-center justify-center rounded-xl ${providerIconTone[provider.key]}`}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-sm font-semibold">{provider.label}</span>
            </span>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          </Button>
        );
      })}
    </div>
  );
}
