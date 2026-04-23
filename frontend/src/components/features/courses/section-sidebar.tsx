"use client";

import Link from "next/link";
import { CheckCircle2, BookOpen, ChevronLeft } from "lucide-react";
import type { SectionItem } from "@/lib/content";
import { routes } from "@/lib/routes";

interface SectionSidebarProps {
  sections: SectionItem[];
  currentSectionId: string;
  slug: string;
  completedIds: Set<string>;
  footerSlot?: React.ReactNode;
}

export function SectionSidebar({
  sections,
  currentSectionId,
  slug,
  completedIds,
  footerSlot,
}: SectionSidebarProps) {
  return (
    <aside
      className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col
  bg-white dark:bg-slate-900
  border border-zinc-200 dark:border-slate-700
  rounded-2xl
  overflow-hidden
  "
    >
      {/* Kursa dön */}
      <div className="px-4 pt-5 pb-3 border-b border-zinc-100 dark:border-slate-700/80">
        <Link
          href={routes.courseDetail(slug)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Kursa Dön
        </Link>
      </div>

      {/* Başlık */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Bölümler
          </span>
        </div>
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {completedIds.size}/{sections.length} tamamlandı
        </p>
      </div>

      {/* Bölüm listesi */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {sections.map((section, index) => {
            const isActive = section.id === currentSectionId;
            const isCompleted = completedIds.has(section.id);

            return (
              <li key={section.id}>
                <Link
                  href={routes.section(slug, section.id)}
                  className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <span
                      className={`w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center rounded-full text-[9px] font-bold border ${
                        isActive
                          ? "border-indigo-400 text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-400"
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
                          : "font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                    }`}
                  >
                    {section.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Alt slot — Tamamladım butonu buraya gelir */}
      {footerSlot && (
        <div className="shrink-0 p-4 border-t border-zinc-100 dark:border-slate-700">
          {footerSlot}
        </div>
      )}
    </aside>
  );
}
