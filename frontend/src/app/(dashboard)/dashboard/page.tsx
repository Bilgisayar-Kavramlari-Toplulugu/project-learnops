"use client";

import { CalendarDays, LayoutDashboard } from "lucide-react";

const todayLabel = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(new Date());

export default function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <header className="rounded-2xl border border-blue-100/80 bg-white/85 px-4 py-3 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-black/20">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <LayoutDashboard className="size-4 text-blue-600 dark:text-sky-400" />
          Dashboard Genel Bakış
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="size-3.5" />
          {todayLabel}
        </p>
      </header>

      <div className="min-h-[62vh] rounded-3xl border border-dashed border-blue-200/90 bg-white/65 px-6 py-8 dark:border-slate-700 dark:bg-slate-900/55">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Task Alanı
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Bu alan dashboard içeriği için hazır.
          </p>
        </div>
      </div>
    </section>
  );
}