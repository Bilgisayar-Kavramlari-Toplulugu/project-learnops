import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-blue-100/70 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-2xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-xl" />
          </div>
          <Skeleton className="h-16 w-44 rounded-2xl" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-blue-100/70 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/70"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-full space-y-3">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
              <Skeleton className="size-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Kurs kartları - yeni yapıya göre */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />

        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-blue-100/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70"
            >
              {/* CardHeader */}
              <div className="flex items-start justify-between gap-4 border-b border-blue-100/70 p-5 dark:border-slate-800">
                <div className="w-full space-y-2">
                  <Skeleton className="h-7 w-56 max-w-full rounded-xl" />
                  <Skeleton className="h-4 w-36 rounded-lg" /> {/* last_section_title */}
                </div>
                <Skeleton className="h-20 w-24 shrink-0 rounded-2xl" /> {/* progress kutusu */}
              </div>

              {/* CardContent - progress bar */}
              <div className="px-5 py-5">
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>

              {/* CardFooter - buton */}
              <div className="border-t border-blue-100/70 px-5 py-4 dark:border-slate-800">
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
