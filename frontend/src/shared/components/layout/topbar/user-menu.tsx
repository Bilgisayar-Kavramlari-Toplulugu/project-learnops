"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { routes } from "@/shared/lib/config/routes";
import { useAuth } from "@/shared/lib/useAuth";
import { cn } from "@/shared/lib/utils";
import type { DashboardUser } from "@/shared/types";
import { dropdownItemClass, dropdownPanelClass } from "./topbar-menu-styles";

interface UserMenuProps {
  user: DashboardUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      router.replace(routes.login);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 rounded-xl px-2 hover:bg-blue-50 dark:hover:bg-slate-800"
        >
          <Avatar className="size-8 border border-blue-100 dark:border-slate-700">
            <AvatarImage alt={user.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-slate-100">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(dropdownPanelClass, "w-60")}>
        <DropdownMenuLabel className="space-y-0.5 rounded-xl bg-blue-50/55 px-2.5 py-2 dark:bg-slate-800/60">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={cn(dropdownItemClass, "opacity-65")}>
          <UserRound className="size-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem className={cn(dropdownItemClass, "opacity-65")}>
          <Settings className="size-4" />
          Ayarlar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
