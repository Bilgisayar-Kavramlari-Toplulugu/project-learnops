import { cn } from "@/lib/utils";
import type { SidebarItem } from "@/types";
import { SidebarBrand } from "./sidebar/sidebar-brand";
import { SidebarMainNav } from "./sidebar/sidebar-main-nav";

interface AppSidebarProps {
  items: SidebarItem[];
  activePath: string;
  className?: string;
}

export function AppSidebar({ items, activePath, className }: AppSidebarProps) {
  return (
    <div
      className={cn(
        "h-[calc(100dvh-1rem)] min-h-[680px] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-sm shadow-slate-200/60 dark:border-slate-700/80 dark:bg-slate-900/82 dark:shadow-black/25",
        className,
      )}
    >
      <div className="space-y-4">
        <SidebarBrand />
        <SidebarMainNav items={items} activePath={activePath} />
      </div>
    </div>
  );
}
