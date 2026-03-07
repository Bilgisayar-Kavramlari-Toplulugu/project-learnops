"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useDashboardScreenData } from "@/hooks/use-dashboard";

interface UiKitPageShellProps {
  title: string;
  description: string;
  activeRoute: string;
  children: ReactNode;
}

const componentLinks = [
  { label: "Exam", href: routes.uiKitExam },
  { label: "Docs", href: routes.uiKitDocs },
  { label: "Form", href: routes.uiKitForm },
  { label: "Typography", href: routes.uiKitTypography },
  { label: "Modal", href: routes.uiKitModal },
  { label: "Input", href: routes.uiKitInput },
] as const;

export function UiKitPageShell({ title, description, activeRoute, children }: UiKitPageShellProps) {
  const { data, isLoading, isFetching, hasAnyError } = useDashboardScreenData();

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-6">
        <p className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {isLoading && !hasAnyError
            ? "UI kit verisi yukleniyor..."
            : "Layout verisi alinamadi. API endpointlerini kontrol et."}
        </p>
      </section>
    );
  }

  return (
    <DashboardShell
      user={data.user}
      sidebarItems={data.sidebarItems}
    >
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="space-y-3 rounded-2xl border border-blue-100/80 bg-white/85 p-4 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-black/20">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
            Theme Components
          </p>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
          <div className="flex flex-wrap gap-2">
            {componentLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                  item.href === activeRoute
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300"
                    : "border-blue-100 bg-white text-slate-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <div className="grid min-h-[55vh] place-items-center rounded-2xl border border-blue-100/80 bg-white/65 p-4 shadow-sm shadow-blue-100/30 dark:border-slate-700 dark:bg-slate-900/65 dark:shadow-black/20">
          <div className="w-full max-w-2xl">{children}</div>
        </div>

        {isFetching ? (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Data sync in progress...
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
