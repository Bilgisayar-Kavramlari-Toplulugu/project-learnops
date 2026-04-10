"use client";

import { Clock, Signal, Tag, CheckCircle2, ChevronLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseDetail } from "@/types";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function CourseDetailClient({ course }: { course: CourseDetail }) {
  const { refreshSession } = useAuth();
  const router = useRouter();

  const ensureAuth = async () => {
    try {
      await refreshSession();
      return true;
    } catch {
      router.replace(routes.login);
      return false;
    }
  };

  // TODO [Alper-Suleyman] Enrollement logic will be implemented here
  const handleEnroll = async () => {
    const isAuth = await ensureAuth();
    if (!isAuth) return;
  };

  const difficultyColors: Record<string, string> = {
    Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Advanced: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  };
  const badgeColor =
    difficultyColors[course.difficulty] ||
    "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";

  const sortedSections = [...(course.sections || [])].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500 pb-20">
      <Link
        href="/courses"
        className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Kurslara Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center gap-3 mb-6">
              <span
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeColor} flex items-center gap-1.5`}
              >
                <Signal className="w-3.5 h-3.5" />
                {course.difficulty}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {course.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700/50">
                <Clock className="w-3.5 h-3.5" />
                {course.duration_minutes} dakika
              </span>
            </div>

            <h1 className="relative z-10 text-3xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="relative z-10 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
              {course.description}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl shadow-inner">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  Müfredat
                </h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                  Toplam {sortedSections.length} bölüm
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sortedSections.length > 0 ? (
                sortedSections.map((section, index) => (
                  <Link
                    href={`/courses/${course.slug}/sections/${section.section_id_str}`}
                    key={section.id}
                    className="flex gap-5 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-md group cursor-pointer block"
                  >
                    <div className="flex w-full gap-5">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 font-extrabold text-lg flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 dark:group-hover:bg-indigo-500/20 dark:group-hover:border-indigo-500/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1.5 overflow-hidden">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                          {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-10 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl font-medium bg-zinc-50/50 dark:bg-zinc-900/30">
                  Bu kursa henüz bölüm (section) eklenmemiş.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 rounded-3xl p-6 lg:p-8 shadow-xl shadow-zinc-200/40 dark:shadow-none lg:sticky lg:top-24 h-fit backdrop-blur-xl">
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3">
            Kursa Katıl
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">
            Bu eğitime katılıp yeteneklerinizi hemen bir üst seviyeye taşıyın.
          </p>

          <button
            onClick={handleEnroll}
            className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 px-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-6 h-6" />
            Hemen Kaydol
          </button>

          <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 mb-5 uppercase tracking-widest">
              Bu Kursun Kazanımları
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                </div>
                Özenle hazırlanmış {sortedSections.length} farklı bölüm
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                </div>
                Sınırsız erişim ve güncellemeler
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                </div>
                Kariyerinizde öne çıkma fırsatı
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
