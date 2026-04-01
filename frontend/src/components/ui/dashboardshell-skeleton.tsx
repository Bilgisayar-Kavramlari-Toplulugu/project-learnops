import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardShellSkeletonProps {
  sidebarItemsCount?: number;
  children?: ReactNode;
}

export function DashboardShellSkeleton({
  sidebarItemsCount = 5,
  children,
}: DashboardShellSkeletonProps) {
  return (
    <div className="min-h-dvh animate-pulse">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px]">
        <aside className="hidden w-[286px] shrink-0 px-2 py-3 lg:block">
          <div className="sticky top-3 flex flex-col gap-2">
            {Array.from({ length: sidebarItemsCount }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <div className="flex h-12 items-center justify-between gap-2 rounded-xl bg-slate-200 dark:bg-slate-700 px-3">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <main className="min-h-0 flex-1 space-y-3">
            {children ? children : <Skeleton className="h-[400px] w-full rounded-lg" />}
          </main>

          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
