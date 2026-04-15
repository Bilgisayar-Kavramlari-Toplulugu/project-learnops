"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import type { SectionItem } from "@/lib/content";
import { routes } from "@/lib/routes";
import { useMarkSectionComplete, useSectionProgress } from "@/hooks/courses/use-section-progress";
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
  const { data: progressItems = [], isLoading: progressLoading } = useSectionProgress(courseSlug);
  const { mutate: markComplete, isPending } = useMarkSectionComplete(courseSlug);

  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set());

  const serverCompletedIds = new Set(
    progressItems.filter((p) => p.completed).map((p) => p.section_id_str),
  );
  const completedIds = new Set([...serverCompletedIds, ...localCompleted]);
  const isCurrentCompleted = completedIds.has(currentSectionId);

  function handleMarkComplete() {
    setLocalCompleted((prev) => new Set([...prev, currentSectionId]));
    markComplete(currentSectionId, {
      onSuccess: () => {
        toast.success("Bölüm tamamlandı!", { description: "İlerlemeniz kaydedildi." });
      },
      onError: () => {
        toast.error("Bölüm kaydedilemedi.", { description: "İlerlemeniz bu oturum için korundu." });
      },
    });
  }

  const completeButton = progressLoading ? (
    <Skeleton className="h-10 w-full rounded-xl" />
  ) : (
    <button
      onClick={handleMarkComplete}
      disabled={isCurrentCompleted || isPending}
      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
        isCurrentCompleted
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default"
          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.97]"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      {isCurrentCompleted ? "Tamamlandı" : "Tamamladım"}
    </button>
  );

  return (
    <div className="flex flex-1 min-h-0 gap-4">
      {/* Sol kolon: article + önceki/sonraki bar — kart */}
      <div className="flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700">
        {/* Scrollable içerik alanı */}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

        {/* Alt nav bar — sadece article altında */}
        <div className="shrink-0 border-t border-zinc-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 flex justify-start">
            {prevSection ? (
              <Link
                href={routes.section(courseSlug, prevSection.id)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Önceki:</span>
                <span className="max-w-[200px] truncate hidden sm:inline">{prevSection.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="flex-1 flex justify-end">
            {nextSection ? (
              <Link
                href={routes.section(courseSlug, nextSection.id)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <span className="hidden sm:inline">Sonraki:</span>
                <span className="max-w-[200px] truncate hidden sm:inline">{nextSection.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>

      {/* Sağ kolon: sidebar (Tamamladım butonu altta) — yüklenirken skeleton */}
      {progressLoading ? (
        <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 gap-2">
          <Skeleton className="h-4 w-24 mb-2" />
          {sections.map((s) => (
            <Skeleton key={s.id} className="h-9 w-full rounded-xl" />
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
