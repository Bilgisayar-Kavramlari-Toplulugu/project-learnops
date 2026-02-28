"use client";

import { Bell, Check, Dot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/modules/dashboard/hooks/use-dashboard";
import { cn } from "@/shared/lib/utils";
import type { NotificationItem } from "@/shared/types";
import { dropdownPanelClass } from "./topbar-menu-styles";

interface NotificationMenuProps {
  notifications: NotificationItem[];
}

export function NotificationMenu({ notifications }: NotificationMenuProps) {
  const [items, setItems] = useState(notifications);
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllNotificationsAsReadMutation = useMarkAllNotificationsAsRead();

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.read).length,
    [items],
  );

  function markAllAsRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    markAllNotificationsAsReadMutation.mutate();
  }

  function markAsRead(notificationId: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    );
    markNotificationAsReadMutation.mutate(notificationId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white dark:bg-sky-500 dark:text-slate-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(dropdownPanelClass, "w-[340px] overflow-hidden p-0")}
      >
        <div className="flex items-center justify-between border-b border-blue-100/80 bg-blue-50/55 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/55">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Mark all as read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {items.length > 0 ? (
            items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(event) => {
                  event.preventDefault();
                  markAsRead(notification.id);
                }}
                className={cn(
                  "mb-1 flex items-start gap-2 rounded-xl px-2.5 py-2 focus:bg-blue-50 dark:focus:bg-slate-800",
                  notification.read
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-800 dark:text-slate-100",
                )}
              >
                <span className="pt-1">
                  {notification.read ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Dot className="size-4 text-blue-600 dark:text-sky-400" />
                  )}
                </span>
                <span className="space-y-0.5">
                  <span className="block text-sm font-semibold">{notification.title}</span>
                  <span className="block text-xs leading-relaxed">{notification.message}</span>
                </span>
                <DropdownMenuShortcut className="mt-0.5 text-[10px]">
                  {notification.timeLabel}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="rounded-xl border border-blue-100/80 bg-white/80 px-3 py-3 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              Bildirim yok.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
