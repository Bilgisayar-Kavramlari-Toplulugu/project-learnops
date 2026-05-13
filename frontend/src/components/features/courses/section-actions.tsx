"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type AxiosError } from "axios";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useMarkSectionComplete, useSectionProgress } from "@/hooks/courses/use-section-progress";
import { useEnrollments } from "@/hooks/enrollments/use-enrollments";
import type { SectionItem } from "@/lib/content";
import { routes } from "@/lib/routes";
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  toast,
} from "@/components/ui";
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
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-slate-700 lg:hidden">
          <Link
            href={routes.courseDetail(courseSlug)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Kursa Dön
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-indigo-200 bg-indigo-50 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              >
                <BookOpen className="h-4 w-4" />
                Bölümler
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,360px)] gap-0 border-l border-zinc-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-900"
            >
              <SheetHeader className="border-b border-zinc-100 px-5 py-4 text-left dark:border-slate-700/80">
                <SheetTitle className="flex items-center gap-2 text-sm">
                  <span className="rounded-lg bg-indigo-50 p-1.5 dark:bg-indigo-500/10">
                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </span>
                  Bölümler
                </SheetTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {completedIds.size}/{sections.length} tamamlandı
                </p>
              </SheetHeader>
              <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                <ul className="space-y-1">
                  {sections.map((section, index) => {
                    const isActive = section.id === currentSectionId;
                    const isCompleted = completedIds.has(section.id);

                    return (
                      <li key={section.id}>
                        <SheetClose asChild>
                          <Link
                            href={routes.section(courseSlug, section.id)}
                            className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                              isActive
                                ? "bg-indigo-50 dark:bg-indigo-500/10"
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <span
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                                  isActive
                                    ? "border-indigo-400 bg-indigo-100 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
                                    : "border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500"
                                }`}
                              >
                                {index + 1}
                              </span>
                            )}
                            <span
                              className={`leading-snug ${
                                isActive
                                  ? "font-semibold text-indigo-700 dark:text-indigo-300"
                                  : isCompleted
                                    ? "font-medium text-zinc-700 dark:text-zinc-300"
                                    : "font-medium text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200"
                              }`}
                            >
                              {section.title}
                            </span>
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
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
