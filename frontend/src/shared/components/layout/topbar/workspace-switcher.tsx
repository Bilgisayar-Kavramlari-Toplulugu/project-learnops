"use client";

import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui.store";
import type { WorkspaceOption } from "@/shared/types";
import { dropdownItemClass, dropdownPanelClass, envBadgeClasses } from "./topbar-menu-styles";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: WorkspaceSwitcherProps) {
  const selectedWorkspaceId = useUiStore((state) => state.selectedWorkspaceId) ?? activeWorkspaceId;
  const setSelectedWorkspaceId = useUiStore((state) => state.setSelectedWorkspaceId);

  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-600 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <span>{selectedWorkspace?.name ?? "Workspace"}</span>
          {selectedWorkspace ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                envBadgeClasses[selectedWorkspace.environment],
              )}
            >
              {selectedWorkspace.environment}
            </span>
          ) : null}
          <ChevronDown className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(dropdownPanelClass, "w-60")}>
        <DropdownMenuLabel className="px-2.5 pb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => setSelectedWorkspaceId(workspace.id)}
            className={cn(dropdownItemClass, "justify-between")}
          >
            <span>{workspace.name}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                envBadgeClasses[workspace.environment],
              )}
            >
              {workspace.environment}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
