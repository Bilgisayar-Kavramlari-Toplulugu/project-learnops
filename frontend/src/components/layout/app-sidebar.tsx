import { cn } from "@/lib/utils";
import type { SidebarItem } from "@/types";
import { SidebarBrand } from "./sidebar/sidebar-brand";
import { SidebarMainNav } from "./sidebar/sidebar-main-nav";

interface AppSidebarProps {
  items: SidebarItem[];
  activePath: string;
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ items, activePath, className, onNavigate }: AppSidebarProps) {
  const mainItems = items.filter((i) => !i.pinBottom);
  const bottomItems = items.filter((i) => i.pinBottom);

  return (
    <div
      className={cn(
        "flex h-[calc(100dvh-1rem)] min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-sm shadow-slate-200/60 dark:border-slate-700/80 dark:bg-slate-900/82 dark:shadow-black/25",
        className,
      )}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <SidebarBrand />
        <SidebarMainNav items={mainItems} activePath={activePath} onNavigate={onNavigate} />
      </div>
      {bottomItems.length > 0 && (
        <div className="shrink-0 pt-4">
          <SidebarMainNav
            items={bottomItems}
            activePath={activePath}
            hideLabel
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
}
