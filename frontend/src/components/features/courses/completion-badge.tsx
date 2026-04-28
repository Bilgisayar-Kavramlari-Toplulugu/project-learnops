"use client";

import { Award, CheckCircle2, Clock } from "lucide-react";

interface CompletionBadgeProps {
  isCompleted: boolean;
  completedAt?: string | null;
  variant?: "inline" | "block" | "highlight";
  showIcon?: boolean;
  className?: string;
}

export function CompletionBadge({
  isCompleted,
  completedAt,
  variant = "inline",
  showIcon = true,
  className = "",
}: CompletionBadgeProps) {
  if (!isCompleted) {
    return null;
  }

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const baseClasses = "inline-flex items-center gap-1.5 font-semibold";

  const variantClasses = {
    inline:
      "px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/30",
    block:
      "px-4 py-3 text-sm bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl border-2 border-emerald-200 dark:border-emerald-500/40",
    highlight:
      "px-4 py-3 text-sm bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10 text-emerald-800 dark:text-emerald-300 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-500/50",
  };

  const iconClasses = {
    inline: "w-3 h-3",
    block: "w-4 h-4",
    highlight: "w-5 h-5",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {showIcon && variant === "inline" && <CheckCircle2 className={iconClasses[variant]} />}
      {showIcon && (variant === "block" || variant === "highlight") && (
        <Award className={iconClasses[variant]} />
      )}
      <div className="flex flex-col gap-0.5">
        <span>Tamamlandı</span>
        {formattedDate && (
          <span className="text-xs opacity-75 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
}
