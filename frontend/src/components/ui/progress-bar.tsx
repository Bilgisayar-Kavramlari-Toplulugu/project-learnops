"use client";

import { Award } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percent: number;
  showPercent?: boolean;
  showCompletionBadge?: boolean;
  showCompletionMessage?: boolean;
  label?: string;
  className?: string;
  color?: "indigo" | "emerald" | "blue";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const colorStyles = {
  indigo: {
    container: "bg-indigo-200/30 dark:bg-indigo-900/30",
    bar: "bg-gradient-to-r from-indigo-500 to-blue-500 shadow-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  emerald: {
    container: "bg-emerald-200/30 dark:bg-emerald-900/30",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  blue: {
    container: "bg-blue-200/30 dark:bg-blue-900/30",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
};

const sizeStyles = {
  sm: {
    container: "h-1.5",
    label: "text-xs",
    percent: "text-xs",
    badge: "gap-1 text-xs",
  },
  md: {
    container: "h-2.5",
    label: "text-sm",
    percent: "text-sm",
    badge: "gap-1.5 text-xs",
  },
  lg: {
    container: "h-3",
    label: "text-base",
    percent: "text-base",
    badge: "gap-2 text-sm",
  },
};

function ProgressBar({
  percent,
  showPercent = true,
  showCompletionBadge = true,
  showCompletionMessage = false,
  label,
  className,
  color = "indigo",
  size = "md",
  animated = true,
}: ProgressBarProps) {
  const colorStyle = colorStyles[color];
  const sizeStyle = sizeStyles[size];
  const displayPercent = Math.max(0, Math.min(Math.round(percent), 100));
  const isComplete = displayPercent >= 100;

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="mb-2 flex items-center justify-between gap-3">
          {label && (
            <span className={cn("font-bold", colorStyle.text, sizeStyle.label)}>{label}</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {showPercent && (
              <span className={cn("font-bold", colorStyle.text, sizeStyle.percent)}>
                %{displayPercent}
              </span>
            )}
            {showCompletionBadge && isComplete && (
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2 py-0.5 font-bold",
                  colorStyle.badge,
                  sizeStyle.badge,
                )}
              >
                <Award className="size-3.5" />
                <span>Tamamlandı</span>
              </span>
            )}
          </div>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={displayPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "İlerleme çubuğu"}
        className={cn(
          "w-full overflow-hidden rounded-full shadow-inner",
          colorStyle.container,
          sizeStyle.container,
        )}
      >
        <div
          className={cn(
            "rounded-full shadow-lg transition-all",
            colorStyle.bar,
            sizeStyle.container,
            animated ? "duration-500 ease-out" : "duration-0",
          )}
          style={{ width: `${displayPercent}%` }}
        />
      </div>

      {showCompletionMessage && isComplete && (
        <p className={cn("mt-2 text-center font-semibold", colorStyle.text, sizeStyle.label)}>
          Tebrikler! Tamamladınız.
        </p>
      )}
    </div>
  );
}

export { ProgressBar, type ProgressBarProps };
