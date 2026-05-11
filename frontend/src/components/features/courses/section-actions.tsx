"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type AxiosError } from "axios";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useMarkSectionComplete, useSectionProgress } from "@/hooks/courses/use-section-progress";
import { useEnrollments } from "@/hooks/enrollments/use-enrollments";
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
  const router = useRouter();

  const { data: course, isLoading: courseLoading } = useCourseDetail(courseSlug);
  const courseId = course?.id;

  const { enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const isEnrolled = courseId ? enrollments.some((e) => e.course_id === courseId) : false;

  const { data: progressItems = [], isLoading: progressLoading } = useSectionProgress(courseId);
  const { mutate: markComplete, isPending } = useMarkSectionComplete(courseId);

  // Direkt URL ile girişe karşı güvenlik ağı
  if (!courseLoading && !enrollmentsLoading && !isEnrolled) return null;

  const completedIds = new Set(
    progressItems
      .filter((progressItem) => progressItem.completed)
      .map((item) => item.section_id_str),
  );
  const isCurrentCompleted = completedIds.has(currentSectionId);
  const allSectionsCompleted = sections.length > 0 && sections.every((s) => completedIds.has(s.id));
  const firstIncompleteSection = sections.find((s) => !completedIds.has(s.id));
  const isButtonDisabled = !courseId || isPending;

  function handleMarkCompleteAndNavigate(navigateTo: string) {
    if (!courseId) return;

    markComplete(currentSectionId, {
      onSuccess: () => {
        toast.success("Bölüm tamamlandı!", {
          description: "İlerlemeniz kaydedildi.",
        });
        router.push(navigateTo);
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;

        if (axiosError?.response?.status === 403) {
          toast.error("Bu kursa kayıtlı değilsiniz.", {
            description: "Kursa kaydolarak ilerlemenizi takip edebilirsiniz.",
          });
        } else {
          toast.error("Bölüm kaydedilemedi.", {
            description: "İlerlemeniz bu oturum için korundu.",
          });
        }
      },
    });
  }

  function handleMarkComplete() {
    if (!courseId) return;

    markComplete(currentSectionId, {
      onSuccess: () => {
        toast.success("Bölüm tamamlandı!", {
          description: "İlerlemeniz kaydedildi.",
        });
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;

        if (axiosError?.response?.status === 403) {
          toast.error("Bu kursa kayıtlı değilsiniz.", {
            description: "Kursa kaydolarak ilerlemenizi takip edebilirsiniz.",
          });
        } else {
          toast.error("Bölüm kaydedilemedi.", {
            description: "İlerlemeniz bu oturum için korundu.",
          });
        }
      },
    });
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 gap-4">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        <div className="flex items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 dark:border-slate-700">
          <div className="flex flex-1 justify-start">
            {prevSection ? (
              <Link
                href={routes.section(courseSlug, prevSection.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-200 hover:border-indigo-300 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Önceki</span>
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="flex flex-1 justify-end">
            {enrollmentsLoading || progressLoading ? (
              <Skeleton className="h-9 w-40 rounded-xl" />
            ) : isEnrolled && !isCurrentCompleted && nextSection ? (
              <Button
                onClick={() =>
                  handleMarkCompleteAndNavigate(routes.section(courseSlug, nextSection.id))
                }
                disabled={isButtonDisabled}
                className="gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.97]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Tamamla ve Devam Et
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : isEnrolled && !isCurrentCompleted && !nextSection ? (
              <Button
                onClick={handleMarkComplete}
                disabled={isButtonDisabled}
                className="gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.97]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Bölümü Tamamla
              </Button>
            ) : nextSection ? (
              <Link
                href={routes.section(courseSlug, nextSection.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-200 hover:border-indigo-300 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              >
                Sonraki
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : allSectionsCompleted ? (
              <Link
                href={routes.quiz(courseSlug)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Quiz&apos;e Git
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={
                  firstIncompleteSection
                    ? routes.section(courseSlug, firstIncompleteSection.id)
                    : routes.courseDetail(courseSlug)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-200 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
              >
                {sections.length - completedIds.size} bölüm kaldı
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
        </aside>
      ) : (
        <SectionSidebar
          sections={sections}
          currentSectionId={currentSectionId}
          slug={courseSlug}
          completedIds={completedIds}
        />
      )}
    </div>
  );
}
