"use client";

import { CheckCircle2, Award } from "lucide-react";
import type { CourseProgress } from "@/types";
import { ProgressBar } from "./progress-bar";
import { CompletionButton } from "./completion-button";

interface SectionCompletionProps {
  sectionIdStr: string;
  courseProgress: CourseProgress;
  onProgressUpdate: (updatedProgress: CourseProgress) => void;
  isCompleted?: boolean;
  className?: string;
}

export function SectionCompletion({
  sectionIdStr,
  courseProgress,
  onProgressUpdate,
  isCompleted,
  className = "",
}: SectionCompletionProps) {
  const sectionProgress = courseProgress.sections.find(
    (s) => s.section_id_str === sectionIdStr,
  );
  const isCurrentCompleted = isCompleted ?? sectionProgress?.completed ?? false;
  const progressPercent = courseProgress.progress_percent;

  const handleCompletionSuccess = (completedAt: string, progressPercent: number) => {
    // Update progress with the response data
    const updatedProgress: CourseProgress = {
      ...courseProgress,
      progress_percent: progressPercent,
      completed_at: progressPercent >= 100 ? new Date().toISOString() : courseProgress.completed_at,
      sections: courseProgress.sections.map((section) =>
        section.section_id_str === sectionIdStr
          ? {
              ...section,
              completed: true,
              completed_at: completedAt,
            }
          : section,
      ),
    };

    onProgressUpdate(updatedProgress);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm">
        <ProgressBar
          percent={progressPercent}
          label="Kurs İlerlemesi"
          color="indigo"
          showCompletionBadge={!!courseProgress.completed_at}
          showCompletionMessage={false}
        />

        {/* Progress Text */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {courseProgress.sections.filter((s) => s.completed).length} /{" "}
            {courseProgress.sections.length} bölüm tamamlandı
          </p>
          {courseProgress.completed_at && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              Tamamlandı
            </span>
          )}
        </div>
      </div>

      {/* Completion Button */}
      <CompletionButton
        sectionIdStr={sectionIdStr}
        isCompleted={isCurrentCompleted}
        onSuccess={handleCompletionSuccess}
      />

      {/* Completion Badge - Appears when course is fully completed */}
      {courseProgress.completed_at && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="font-bold text-emerald-900 dark:text-emerald-100">
              Kursu Tamamladınız!
            </p>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Tebrikler! Tüm bölümleri başarıyla tamamladınız.
          </p>
        </div>
      )}

      {/* Section Completion Status Cards */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">
          Bölüm Durumları
        </h4>
        <div className="space-y-2">
          {courseProgress.sections.map((section) => (
            <div
              key={section.section_id_str}
              className={`flex items-center gap-3 p-2 px-3 rounded-lg transition-all ${
                section.completed
                  ? "bg-emerald-50 dark:bg-emerald-500/10"
                  : "bg-zinc-50 dark:bg-zinc-800/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  section.completed
                    ? "bg-emerald-500"
                    : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                {section.completed && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <span
                className={`flex-1 text-xs font-semibold ${
                  section.completed
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {section.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
