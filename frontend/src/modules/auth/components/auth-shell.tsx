import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";

interface AuthShellProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ icon, title, description, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh items-start justify-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(840px_460px_at_50%_8%,rgba(80,141,255,0.16),transparent_65%)] dark:bg-[radial-gradient(860px_480px_at_50%_8%,rgba(88,149,255,0.2),transparent_66%)]" />
      <div className="pointer-events-none absolute -top-20 -left-10 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl dark:bg-cyan-500/15" />
      <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-500/15" />
      <div className="fixed top-3 right-3 z-50 sm:top-4 sm:right-4">
        <ThemeToggle />
      </div>
      <Card className="relative w-full max-w-[560px] border-blue-100/90 bg-white/90 shadow-xl shadow-blue-100/50 backdrop-blur dark:border-slate-700 dark:bg-slate-900/84 dark:shadow-black/25">
        <CardHeader className="pb-3 text-center">
          <p className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 text-blue-700 ring-8 ring-blue-50/80 dark:from-slate-800 dark:to-slate-700 dark:text-sky-300 dark:ring-slate-800/70">
            {icon}
          </p>
          <CardTitle className="pt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">{children}</CardContent>
      </Card>
    </main>
  );
}
