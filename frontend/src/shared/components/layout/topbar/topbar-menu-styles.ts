import type { WorkspaceOption } from "@/shared/types";

export const envBadgeClasses: Record<WorkspaceOption["environment"], string> = {
  prod: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  staging: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  dev: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

export const dropdownPanelClass =
  "rounded-2xl border border-blue-100/85 bg-white/95 p-1.5 shadow-xl shadow-blue-100/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/40";

export const dropdownItemClass =
  "rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 focus:bg-blue-50 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-slate-800";
