import { CalendarDays, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/ui/initials-avatar";

const todayLabel = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

interface WelcomeHeaderProps {
  userName: string;
  courseCount: number;
  avatarType: string | null;
}

export function WelcomeHeader({ userName, courseCount, avatarType }: WelcomeHeaderProps) {
  return (
    <section className="rounded-[28px] border border-blue-100/80 bg-white/85 p-5 shadow-sm shadow-blue-100/40 backdrop-blur sm:p-6 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-[11px] tracking-[0.12em] text-blue-700 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
          >
            <Sparkles className="size-3.5" />
            Dashboard
          </Badge>
          <div className="flex items-center gap-2">
            <InitialsAvatar name={userName} avatarType={avatarType} />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              Merhaba, {userName}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              {courseCount > 0
                ? "Kurs ilerlemeni, tamamlanan eğitimlerini ve aktif öğrenme akışını buradan takip edebilirsin."
                : "Henüz kayıtlı kurs görünmüyor. Yeni bir kursa başladığında ilerleme kartların burada listelenecek."}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-3 self-start rounded-2xl border border-blue-100/90 bg-blue-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
              Bugün
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{todayLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
