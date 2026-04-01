import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { routes } from "@/lib/routes";
import type { DashboardProfile, SidebarItem } from "@/types";
import { AppFooter } from "./app-footer";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

interface DashboardShellProps {
  user: DashboardProfile;
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
        <aside className="hidden w-[286px] shrink-0 px-2 py-3 lg:block">
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
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-xl text-slate-600 hover:bg-blue-50 lg:hidden"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[286px] border-r border-slate-200 bg-white p-0 sm:max-w-none dark:border-slate-700 dark:bg-slate-900"
                >
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
