import Link from "next/link";

import { helpAction } from "./sidebar-config";

export function SidebarHelpCard() {
  const Icon = helpAction.icon;

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white/85 p-3 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
      <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">
        Yardim Lazim Mi?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Dokumantasyon ve onboarding adimlarini bu bloktan takip edebilirsin.
      </p>
      <Link
        href={helpAction.href}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
      >
        <Icon className="size-3.5" />
        {helpAction.label}
      </Link>
    </div>
  );
}
