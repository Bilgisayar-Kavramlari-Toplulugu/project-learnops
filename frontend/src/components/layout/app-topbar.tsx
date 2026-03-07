"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { DashboardUser } from "@/types";
import { UserMenu } from "./topbar/user-menu";
import { ThemeToggle } from "./theme-toggle";

interface AppTopbarProps {
  user: DashboardUser;
  mobileNav?: ReactNode;
}

export function AppTopbar({ user, mobileNav }: AppTopbarProps) {
  const todayLabel = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100/80 bg-white/80 px-3 py-2.5 shadow-sm shadow-blue-100/40 backdrop-blur sm:px-4 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-black/20">
      <div className="flex items-center gap-2">
        <div className="lg:hidden">{mobileNav}</div>
        <div className="hidden items-center gap-2 sm:flex">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            LearnOps Panel
          </p>
          <Badge
            variant="outline"
            className="rounded-full border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
          >
            {todayLabel}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
