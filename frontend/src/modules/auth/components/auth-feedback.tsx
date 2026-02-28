import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type FeedbackTone = "info" | "success" | "error";

interface AuthFeedbackProps {
  message: string;
  tone: FeedbackTone;
}

const toneMap: Record<FeedbackTone, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className:
      "border-blue-100 bg-blue-50/70 text-blue-700 dark:border-sky-900/60 dark:bg-sky-900/20 dark:text-sky-300",
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-100 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  error: {
    icon: AlertCircle,
    className:
      "border-red-100 bg-red-50/70 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300",
  },
};

export function AuthFeedback({ message, tone }: AuthFeedbackProps) {
  const config = toneMap[tone];
  const Icon = config.icon;

  return (
    <p
      className={cn(
        "inline-flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
