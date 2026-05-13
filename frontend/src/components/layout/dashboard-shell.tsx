import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { Button, Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui";
import { routes } from "@/lib/routes";
import type { DashboardProfile, SidebarItem } from "@/types";
import { AppFooter } from "./app-footer";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

interface DashboardShellProps {
  user?: DashboardProfile;
  sidebarItems: SidebarItem[];
  activePath?: string;
  children: ReactNode;
}

export function DashboardShell({
  user,
  sidebarItems,
  activePath = routes.dashboard,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px]">
        <aside className="hidden w-[286px] shrink-0 px-2 py-3 md:block">
          <div className="sticky top-3">
            <AppSidebar items={sidebarItems} activePath={activePath} />
          </div>
        </aside>
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <AppTopbar
            user={user}
            mobileNav={
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-blue-50 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  showCloseButton={false}
                  className="w-[286px] border-r border-slate-200 bg-white p-0 sm:max-w-none dark:border-slate-700 dark:bg-slate-900"
                >
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="absolute top-5 right-5 z-10 rounded-xl border-blue-100 bg-white/90 text-slate-500 shadow-sm shadow-blue-100/40 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:shadow-black/20 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      aria-label="Menüyü kapat"
                    >
                      <X className="size-4" />
                    </Button>
                  </SheetClose>
                  <AppSidebar
                    items={sidebarItems}
                    activePath={activePath}
                    className="h-full rounded-none border-0 bg-transparent shadow-none"
                  />
                </SheetContent>
              </Sheet>
            }
          />
          <main className="min-h-0 flex-1">{children}</main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
