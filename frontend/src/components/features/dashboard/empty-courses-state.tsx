import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui";
import { routes } from "@/lib/routes";

export function EmptyCoursesState() {
  return (
    <section className="rounded-[28px] border border-dashed border-blue-200/90 bg-white/75 px-6 py-12 text-center shadow-sm shadow-blue-100/30 dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-black/20">
      <div className="mx-auto flex max-w-xl flex-col items-center space-y-4">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-300">
          <BookOpen className="size-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Henüz kayıtlı kurs görünmüyor
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Dashboard kartları, kayıt olduğun kurslar ve ilerleme verileri geldikçe burada
            listelenecek.
          </p>
        </div>
        <Button
          asChild
          className="h-11 rounded-2xl bg-blue-600 px-5 text-sm font-semibold hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-900 dark:hover:bg-sky-400"
        >
          <Link href={routes.courses}>
            Kursları İncele
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
