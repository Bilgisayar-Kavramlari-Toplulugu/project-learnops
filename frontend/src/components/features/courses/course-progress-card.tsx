"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { type CourseDetail, type CourseProgress } from "@/types";
import { routes } from "@/lib/routes";
import { ProgressBar } from "./progress-bar";
import { CompletionBadge } from "./completion-badge";
import { cn } from "@/lib/utils";

interface CourseProgressCardProps {
  course: CourseDetail;
  courseProgress?: CourseProgress | null;
  className?: string;
}

export default function CourseProgressCard({
  course,
  courseProgress,
  className = "",
}: CourseProgressCardProps) {
  if (!courseProgress) {
    return null;
  }

  const sortedSections = [...(course.sections || [])].sort((a, b) => a.order_index - b.order_index);

  const totalSections = sortedSections.length;
  const completedCount = courseProgress.sections.filter((s) => s.completed).length;
  const progressPercent = courseProgress.progress_percent;
  const isCompleted = courseProgress.completed_at != null;

  const targetSection =
    sortedSections.find(
      (section) =>
        !courseProgress.sections.some(
          (p) => p.section_id_str === section.section_id_str && p.completed,
        ),
    ) || sortedSections[sortedSections.length - 1];

  const categoryColor =
    "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50";

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Ana Card */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow backdrop-blur-xl overflow-hidden">
        <div className="space-y-4">
          {/* Başlık ve Kategori */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 truncate">
                {course.title}
              </h3>
              {course.category && (
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-semibold rounded-full border px-3 py-1",
                    categoryColor,
                  )}
                >
                  {course.category}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                {completedCount} / {totalSections} Bölüm
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <ProgressBar
              percent={progressPercent}
              color="indigo"
              size="md"
              showPercent={false}
              showCompletionBadge={false}
              showCompletionMessage={false}
            />
          </div>

          {/* Son Section Adı */}
          {!isCompleted && targetSection && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Sonraki Bölüm
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {targetSection.title}
              </p>
            </div>
          )}

          {/* Devam Et Butonu */}
          {targetSection && (
            <Link
              href={routes.section(course.slug, targetSection.section_id_str)}
              className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Kursu Gözden Geçir
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Devam Et
                </>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Bölüm Durumları */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">
          Bölüm Durumları
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedSections.length > 0 ? (
            sortedSections.map((section) => {
              const progress = courseProgress.sections.find(
                (p) => p.section_id_str === section.section_id_str,
              );
              const isSectionCompleted = progress?.completed ?? false;

              return (
                <div
                  key={section.section_id_str}
                  className={`flex items-center gap-3 p-2.5 px-3.5 rounded-lg transition-all ${
                    isSectionCompleted
                      ? "bg-emerald-50 dark:bg-emerald-500/10"
                      : "bg-zinc-50 dark:bg-zinc-800/50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSectionCompleted ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    {isSectionCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`flex-1 text-xs font-semibold ${
                      isSectionCompleted
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {section.title}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4">
              Henüz bölüm bulunmuyor
            </p>
          )}
        </div>
      </div>

      {/* Tamamlanma Rozeti */}
      {isCompleted && courseProgress.completed_at && (
        <CompletionBadge
          isCompleted={true}
          completedAt={courseProgress.completed_at}
          variant="highlight"
        />
      )}
    </div>
  );
}
