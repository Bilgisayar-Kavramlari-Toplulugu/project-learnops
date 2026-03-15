import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { sidebarComponentLinks, sidebarSystemNotes } from "./sidebar-config";

export function SidebarComponentTools() {
  return (
    <div className="space-y-3">
      <p className="px-2 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
        UI Components
      </p>

      <div className="space-y-2">
        {sidebarComponentLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              className="group flex items-center justify-between rounded-2xl border border-blue-100/80 bg-white/85 px-3 py-2.5 transition hover:bg-blue-50/75 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800/80"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-300">
                  <Icon className="size-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {link.label}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    {link.description}
                  </span>
                </span>
              </span>
              <ArrowUpRight className="size-3.5 text-slate-400 transition group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-sky-300" />
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-100/80 bg-white/85 p-3 dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
          Sistem Notlari
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sidebarSystemNotes.map((note) => (
            <span
              key={note.label}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold",
                note.toneClass,
              )}
            >
              {note.label}: {note.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
