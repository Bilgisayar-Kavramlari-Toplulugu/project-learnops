"use client";

import type { ReactNode } from "react";
import type { DashboardUser, NotificationItem, WorkspaceOption } from "@/shared/types";
import { NotificationMenu } from "./topbar/notification-menu";
import { UserMenu } from "./topbar/user-menu";
import { WorkspaceSwitcher } from "./topbar/workspace-switcher";
import { ThemeToggle } from "./theme-toggle";

interface AppTopbarProps {
  user: DashboardUser;
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
  notifications: NotificationItem[];
  mobileNav?: ReactNode;
}

export function AppTopbar({
  user,
  workspaces,
  activeWorkspaceId,
  notifications,
  mobileNav,
}: AppTopbarProps) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100/80 bg-white/80 px-3 py-2.5 shadow-sm shadow-blue-100/40 backdrop-blur sm:px-4 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-black/20">
      <div className="flex items-center gap-2">
        <div className="lg:hidden">{mobileNav}</div>
        <p className="hidden text-xs font-medium tracking-wide text-slate-500 uppercase sm:block dark:text-slate-400">
          LearnOps Panel
        </p>
      </div>
      <div className="flex items-center gap-2">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        />
        <NotificationMenu notifications={notifications} />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
