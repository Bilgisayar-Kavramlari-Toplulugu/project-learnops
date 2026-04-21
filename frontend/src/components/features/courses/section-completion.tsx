"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Award } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { CourseProgress } from "@/types";

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
  const [isCompleting, setIsCompleting] = useState(false);
  const sectionProgress = courseProgress.sections.find(
    (s) => s.section_id_str === sectionIdStr,
  );
  const isCurrentCompleted = isCompleted ?? sectionProgress?.completed ?? false;
  const progressPercent = courseProgress.progress_percent;

  const handleCompleteSection = async () => {
    setIsCompleting(true);
    try {
      const response = await api.post(
        `/progress/sections/${sectionIdStr}/complete`,
      );

      // Update progress with the response data
      const updatedProgress: CourseProgress = {
        ...courseProgress,
        progress_percent: response.data.course_progress_percent,
        completed_at: response.data.course_completed_at,
        sections: courseProgress.sections.map((section) =>
          section.section_id_str === sectionIdStr
            ? {
                ...section,
                completed: true,
                completed_at: response.data.completed_at,
              }
            : section,
        ),
      };

      onProgressUpdate(updatedProgress);

      toast.success("Bölüm tamamlandı!", {
        description: "İlerlemeniz kaydedildi.",
      });
    } catch (error) {
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
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wide">
            Kurs İlerlemesi
          </h3>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            %{Math.round(progressPercent)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-indigo-200/30 dark:bg-indigo-900/30 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-indigo-500/20"
            style={{ width: `${Math.round(progressPercent)}%` }}
          />
        </div>

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
      <div className="flex gap-3">
        <button
          onClick={handleCompleteSection}
          disabled={isCurrentCompleted || isCompleting}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            isCurrentCompleted
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 cursor-default"
              : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {isCompleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : isCurrentCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Bölüm Tamamlandı
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Bölümü Tamamla
            </>
          )}
        </button>
      </div>

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
