import Link from "next/link";

import { routes } from "@/lib/routes";

export function SidebarBrand() {
  return (
    <Link
      href={routes.dashboard}
      className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100/80 bg-white/90 px-3 py-3 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-black/20"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-base font-bold text-white shadow-sm">
          L
        </div>
        <div className="leading-none">
          <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            LearnOps
          </p>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Egitim Platformu
          </p>
        </div>
      </div>
    </Link>
  );
}
