import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import { CourseListClient } from "@/components/features/courses/course-list-client";
import { getCourses } from "@/lib/courses";

export const metadata = {
  title: "Kurslar | LearnOps",
  description: "Kendinizi geliştirmeniz için hazırlanan profesyonel eğitim içerikleri.",
};

export default async function CoursesPage() {
  const [courses] = await Promise.all([
    getCourses(),       // DB veya API fetch
  ]);
  return (
    <WrapperContainer>
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Eğitim Kataloğu
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Yeni yetenekler edinin ve kariyerinizde bir adım öne geçin.
        </p>
      </div>

      <CourseListClient initialCourses={courses} />
    </WrapperContainer>
  );
}
