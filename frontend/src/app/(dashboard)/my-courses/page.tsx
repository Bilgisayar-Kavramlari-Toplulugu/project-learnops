import { getEnrolledCourses } from "@/lib/fetchCourses";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import CoursesClient from "@/components/features/courses/courses-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default async function MyCoursesPage() {
  const courses = await getEnrolledCourses();

  if (courses.length === 0) {
    return (
      <WrapperContainer>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <h2 className="text-2xl font-semibold text-gray-700">Henüz kayıtlı kursunuz yok</h2>
          <p className="text-gray-500 mb-6">Kurslara göz atmak ve kayıt olmak için kurslar sayfasını ziyaret edin.</p>
          <Button asChild>
            <Link href={routes.courses}>Kurslara Göz At</Link>
          </Button>
        </div>
      </WrapperContainer>
    );
  }

  return (
    <WrapperContainer>
      <CoursesClient 
        courses={courses} 
        title="Kayıtlı Kurslarım"
        subtitle="Kayıt olduğunuz kursları yönetin ve öğrenmeye devam edin."
      />
    </WrapperContainer>
  );
}