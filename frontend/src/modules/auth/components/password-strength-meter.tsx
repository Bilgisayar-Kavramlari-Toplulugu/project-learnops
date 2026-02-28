import { Check, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { evaluatePasswordStrength } from "@/modules/auth/utils/password-strength";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result = evaluatePasswordStrength(password);
  const progress = (result.score / 5) * 100;

  const toneClass =
    result.label === "Guclu"
      ? "bg-emerald-500"
      : result.label === "Iyi"
        ? "bg-sky-500"
        : result.label === "Orta"
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className="space-y-2 rounded-xl border border-blue-100/80 bg-blue-50/35 p-3 dark:border-slate-700 dark:bg-slate-900/55">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 uppercase dark:text-slate-400">Sifre gucu</span>
        <span className="text-slate-700 dark:text-slate-200">{result.label}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn("h-full rounded-full transition-all", toneClass)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {result.checks.map((check) => (
          <p
            key={check.id}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs",
              check.passed
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            {check.passed ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {check.label}
          </p>
        ))}
      </div>
    </div>
  );
}
