"use client";
import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import type { DashboardProfile } from "@/types";
import { dropdownItemClass, dropdownPanelClass } from "./topbar-menu-styles";

interface UserMenuProps {
  user: DashboardProfile;
}
export function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    } finally {
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 items-center gap-2 rounded-xl border-blue-100 bg-white/80 px-2.5 text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <InitialsAvatar
            name={user.display_name}
            avatarType={user.avatar_type}
            className="size-7"
          />
          <span className="hidden min-w-0 flex-col items-start text-left sm:inline-flex">
            <span className="max-w-[140px] truncate text-sm font-semibold">
              {user.display_name}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <UserRound className="size-3" />
              Profil
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(dropdownPanelClass, "w-56")}>
        <DropdownMenuLabel className="space-y-0.5 rounded-xl bg-blue-50/55 px-2.5 py-2 dark:bg-slate-800/60">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{user.display_name}</p>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={dropdownItemClass}>
          <Link href={routes.profile}>
            <UserRound className="size-4" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
          className={cn(
            dropdownItemClass,
            "text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300",
          )}
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Cikis yapiliyor..." : "Cikis Yap"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
