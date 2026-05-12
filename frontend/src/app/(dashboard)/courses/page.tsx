import CoursesClient from "@/components/features/courses/courses-client";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import { getCourses } from "@/lib/fetchCourses";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();

  const headerSlot = (
    <>
      <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
        <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tüm Kurslar
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Yeni beceriler keşfetmek için eğitimlerimize göz atın.
        </p>
      </div>
    </>
  );

  return (
    <WrapperContainer wide>
      <CoursesClient courses={courses} headerSlot={headerSlot} />
    </WrapperContainer>
  );
}
