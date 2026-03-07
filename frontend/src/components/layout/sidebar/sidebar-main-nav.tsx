import Link from "next/link";

import { cn } from "@/lib/utils";
import type { SidebarItem } from "@/types";

interface SidebarMainNavProps {
  items: SidebarItem[];
  activePath: string;
}

export function SidebarMainNav({ items, activePath }: SidebarMainNavProps) {
  return (
    <div className="space-y-2">
      <p className="px-2 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
        Ana Menu
      </p>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const isActive = item.href === activePath;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition",
                isActive
                  ? "border-blue-100 bg-white text-slate-900 shadow-sm shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/20"
                  : "border-transparent text-slate-600 hover:border-blue-100/80 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/75 dark:hover:text-slate-100",
              )}
            >
              {isActive ? (
                <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-blue-600" />
              ) : null}
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-700 group-hover:bg-blue-100 dark:bg-slate-800 dark:text-sky-300 dark:group-hover:bg-slate-700",
                )}
              >
                <Icon className="size-[18px]" />
              </div>
              <span className="text-sm font-semibold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
