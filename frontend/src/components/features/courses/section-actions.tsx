"use client";

import Link from "next/link";
import { type AxiosError } from "axios";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useMarkSectionComplete, useSectionProgress } from "@/hooks/courses/use-section-progress";
import type { SectionItem } from "@/lib/content";
import { routes } from "@/lib/routes";
import { Button, Skeleton, toast } from "@/components/ui";
import { SectionSidebar } from "./section-sidebar";

interface SectionActionsProps {
  courseSlug: string;
  currentSectionId: string;
  sections: SectionItem[];
  prevSection: SectionItem | null;
  nextSection: SectionItem | null;
  children: React.ReactNode;
}

export function SectionActions({
  courseSlug,
  currentSectionId,
  sections,
  prevSection,
  nextSection,
  children,
}: SectionActionsProps) {
  const { data: course } = useCourseDetail(courseSlug);
  const courseId = course?.id;

  const { data: progressItems = [], isLoading: progressLoading } = useSectionProgress(courseId);
  const { mutate: markComplete, isPending } = useMarkSectionComplete(courseId);

  const completedIds = new Set(
    progressItems
      .filter((progressItem) => progressItem.completed)
      .map((item) => item.section_id_str),
  );
  const isCurrentCompleted = completedIds.has(currentSectionId);
  const isButtonDisabled = !courseId || isCurrentCompleted || isPending;

  function handleMarkComplete() {
    if (!courseId) return;

    markComplete(currentSectionId, {
      onSuccess: () => {
        toast.success("B\u00f6l\u00fcm tamamland\u0131!", {
          description: "\u0130lerlemeniz kaydedildi.",
        });
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;

        if (axiosError?.response?.status === 403) {
          toast.error("Bu kursa kay\u0131tl\u0131 de\u011filsiniz.", {
            description: "Kursa kaydolarak ilerlemenizi takip edebilirsiniz.",
          });
        } else {
          toast.error("B\u00f6l\u00fcm kaydedilemedi.", {
            description: "\u0130lerlemeniz bu oturum i\u00e7in korundu.",
          });
        }
      },
    });
  }

  const completeButton = progressLoading ? (
    <Skeleton className="h-10 w-full rounded-xl" />
  ) : (
    <Button
      onClick={handleMarkComplete}
      disabled={isButtonDisabled}
      className={`w-full gap-2 rounded-xl text-sm font-bold ${
        isCurrentCompleted
          ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : isButtonDisabled
            ? "cursor-not-allowed bg-indigo-300 text-white shadow-none dark:bg-indigo-400/40"
            : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.97]"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      {isCurrentCompleted ? "Tamamland\u0131" : "Tamamlad\u0131m"}
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        <div className="flex items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 dark:border-slate-700">
          <div className="flex flex-1 justify-start">
            {prevSection ? (
              <Link
                href={routes.section(courseSlug, prevSection.id)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">\u00d6nceki:</span>
                <span className="hidden max-w-[200px] truncate sm:inline">{prevSection.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="flex flex-1 justify-end">
            {nextSection ? (
              <Link
                href={routes.section(courseSlug, nextSection.id)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <span className="hidden sm:inline">Sonraki:</span>
                <span className="hidden max-w-[200px] truncate sm:inline">{nextSection.title}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>

      {progressLoading ? (
        <aside className="hidden w-64 shrink-0 flex-col gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-4 dark:border-slate-700 dark:bg-slate-900 lg:flex xl:w-72">
          <Skeleton className="mb-2 h-4 w-24" />
          {sections.map((section) => (
            <Skeleton key={section.id} className="h-9 w-full rounded-xl" />
          ))}
          <div className="mt-auto pt-4">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </aside>
      ) : (
        <SectionSidebar
          sections={sections}
          currentSectionId={currentSectionId}
          slug={courseSlug}
          completedIds={completedIds}
          footerSlot={completeButton}
        />
      )}
    </div>
  );
}
