// components/features/dashboard/completed-courses-section.tsx
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

import { Badge, Button, Card, CardContent } from "@/components/ui";
import type { EnrolledCourseItem } from "@/types";

interface CompletedCoursesSectionProps {
  courses: EnrolledCourseItem[];
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Süre belirtilmedi";

  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} sa`;
  }

  return `${hours} sa ${remainingMinutes} dk`;
}

function formatCompletedDate(date: string | null): string | null {
  if (!date) return null;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function CompletedCoursesSection({
  courses,
}: CompletedCoursesSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Tamamlanan Kurslar
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bitirdiğin eğitimleri tekrar açabilir veya quizlerine dönebilirsin.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-emerald-700 uppercase dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {courses.length} tamamlanan kurs
        </Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {courses.map((item) => {
          const completedDate = formatCompletedDate(item.completed_at);

          return (
            <Card
              key={item.id}
              className="gap-0 rounded-[28px] border-emerald-100/80 bg-white/90 py-0 shadow-sm shadow-emerald-100/35 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20"
            >
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <CheckCircle2 className="size-5" />
                      </div>

                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                      >
                        Tamamlandı
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {item.course.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{item.course.category ?? "Genel"}</span>

                        <span>•</span>

                        <span>{item.course.difficulty ?? "Seviye yok"}</span>

                        <span>•</span>

                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          {formatDuration(item.course.duration_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-right dark:border-emerald-900/50 dark:bg-emerald-950/25">
                    <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                      İlerleme
                    </p>

                    <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      %{Math.round(item.progress_percent)}
                    </p>
                  </div>
                </div>

                {completedDate && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Tamamlanma tarihi:{" "}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {completedDate}
                    </span>
                  </p>
                )}

                <div className="flex flex-wrap gap-3 border-t border-emerald-100/80 pt-4 dark:border-slate-800">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-xl border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
                  >
                    <Link href={`/courses/${item.course.slug}`}>
                      Kursa Git
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-xl border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                  >
                    <Link href={`/courses/${item.course.slug}/quiz`}>
                      Quiz&apos;e Git
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}