"use client";

import { Award } from "lucide-react";

interface ProgressBarProps {
  /**
   * Progress percentage (0-100)
   */
  percent: number;
  /**
   * Show percentage text
   */
  showPercent?: boolean;
  /**
   * Show completion badge if 100%
   */
  showCompletionBadge?: boolean;
  /**
   * Show completion message if 100%
   */
  showCompletionMessage?: boolean;
  /**
   * Optional label text
   */
  label?: string;
  /**
   * Optional additional className
   */
  className?: string;
  /**
   * Color theme: 'indigo' (default), 'emerald', 'blue'
   */
  color?: "indigo" | "emerald" | "blue";
  /**
   * Size variant: 'sm', 'md', 'lg'
   */
  size?: "sm" | "md" | "lg";
  /**
   * Show animated gradient background
   */
  animated?: boolean;
}

const colorStyles = {
  indigo: {
    container: "bg-indigo-200/30 dark:bg-indigo-900/30",
    bar: "bg-gradient-to-r from-indigo-500 to-blue-500 shadow-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    badge: "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  },
  emerald: {
    container: "bg-emerald-200/30 dark:bg-emerald-900/30",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  blue: {
    container: "bg-blue-200/30 dark:bg-blue-900/30",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
};

const sizeStyles = {
  sm: {
    container: "h-1.5",
    label: "text-xs",
    percent: "text-xs",
    badge: "text-xs gap-1",
  },
  md: {
    container: "h-2.5",
    label: "text-sm",
    percent: "text-sm",
    badge: "text-xs gap-1.5",
  },
  lg: {
    container: "h-3",
    label: "text-base",
    percent: "text-base",
    badge: "text-sm gap-2",
  },
};

export function ProgressBar({
  percent,
  showPercent = true,
  showCompletionBadge = true,
  showCompletionMessage = false,
  label,
  className = "",
  color = "indigo",
  size = "md",
  animated = true,
}: ProgressBarProps) {
  const colorStyle = colorStyles[color];
  const sizeStyle = sizeStyles[size];
  const isComplete = percent >= 100;
  const displayPercent = Math.max(0, Math.min(Math.round(percent), 100));

  return (
    <div className={className}>
      {/* Label and percentage */}
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span
              className={`font-bold ${colorStyle.text} ${sizeStyle.label}`}
            >
              {label}
            </span>
          )}
          <div className="flex items-center gap-2">
            {showPercent && (
              <span className={`font-bold ${colorStyle.text} ${sizeStyle.percent}`}>
                %{displayPercent}
              </span>
            )}
            {showCompletionBadge && isComplete && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg font-bold ${colorStyle.badge} ${sizeStyle.badge}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Tamamlandı</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={displayPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Kurs ilerleme çubuğu"}
        className={`w-full ${colorStyle.container} rounded-full overflow-hidden shadow-inner ${sizeStyle.container}`}
      >
        <div
          className={`${colorStyle.bar} ${sizeStyle.container} rounded-full transition-all ${
            animated ? "duration-500 ease-out" : "duration-0"
          } shadow-lg`}
          style={{ width: `${displayPercent}%` }}
        />
      </div>

      {/* Completion message */}
      {showCompletionMessage && isComplete && (
        <p className={`text-center font-semibold mt-2 ${colorStyle.text} ${sizeStyle.label}`}>
          Tebrikler! Tamamladınız! 🎉
        </p>
      )}
    </div>
  );
}
