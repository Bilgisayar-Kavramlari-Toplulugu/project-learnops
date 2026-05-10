import Link from "next/link";

import CourseItem from "@/components/features/courses/course-item";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import type { Course } from "@/types";

interface CoursesSectionProps {
  courses: Course[];
}

export function CoursesSection({ courses }: CoursesSectionProps) {
  return (
    <section id="kurslara-goz-at" className="scroll-mt-20 pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Kurslara Göz At
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            DevOps yolculuğuna uygun kursu seç.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Giriş yapmadan önce içeriklere göz atabilir, ilgini çeken kursun detaylarını
            inceleyebilirsin.
          </p>
        </div>

        <Button asChild variant="outline" className="h-10 rounded-full px-5">
          <Link href={routes.courses}>Tüm kurslar</Link>
        </Button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseItem key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center">
          <h3 className="text-base font-semibold">Kurslar şu anda yüklenemedi.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Katalog kısa süre içinde tekrar görünür olacaktır.
          </p>
        </div>
      )}
    </section>
  );
}
