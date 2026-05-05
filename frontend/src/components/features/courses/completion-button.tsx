"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { AxiosError } from "axios";

import { Button, toast } from "@/components/ui";
import { api } from "@/lib/api";

interface CompletionButtonProps {
  sectionIdStr: string;
  isCompleted?: boolean;
  /**
   * Called when section completion succeeds
   * @param completedAt - Section completion timestamp from server
   * @param progressPercent - Updated course progress percentage
   * @param courseCompletedAt - Course completion timestamp if course is now fully completed, null otherwise
   */
  onSuccess?: (
    completedAt: string,
    progressPercent: number,
    courseCompletedAt: string | null,
  ) => void;
  onError?: (error: unknown) => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function CompletionButton({
  sectionIdStr,
  isCompleted = false,
  onSuccess,
  onError,
  variant = "primary",
  size = "md",
  showIcon = true,
  fullWidth = true,
  className = "",
}: CompletionButtonProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  const buttonSize = {
    sm: "sm",
    md: "default",
    lg: "lg",
  } as const;

  const variantClasses = {
    primary: completed
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 cursor-default"
      : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.97]",
    secondary: completed
      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-default"
      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 active:scale-[0.97]",
    outline: completed
      ? "border-2 border-emerald-500 dark:border-emerald-400 bg-transparent text-emerald-600 dark:text-emerald-400 cursor-default"
      : "border-2 border-indigo-600 dark:border-indigo-500 bg-transparent text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 active:scale-[0.97]",
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await api.post(`/progress/sections/${sectionIdStr}/complete`);

      setCompleted(true);

      if (onSuccess) {
        onSuccess(
          response.data.completed_at,
          response.data.course_progress_percent,
          response.data.course_completed_at ?? null,
        );
      }

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

      if (onError) {
        onError(error);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const isDisabled = completed || isCompleting;

  return (
    <Button
      type="button"
      onClick={handleComplete}
      disabled={isDisabled}
      size={buttonSize[size]}
      className={`font-bold rounded-xl ${
        fullWidth ? "w-full" : ""
      } ${variantClasses[variant]} ${isCompleting ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {isCompleting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Kaydediliyor...</span>
        </>
      ) : (
        <>
          {showIcon && <CheckCircle2 className="w-4 h-4" />}
          <span>{completed ? "Bölüm Tamamlandı" : "Bölümü Tamamla"}</span>
        </>
      )}
    </Button>
  );
}
