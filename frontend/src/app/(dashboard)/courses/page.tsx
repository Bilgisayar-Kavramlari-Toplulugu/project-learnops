import CoursesClient from "@/components/features/courses/courses-client";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import { getCourses } from "@/lib/fetchCourses";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <WrapperContainer>
      <CoursesClient courses={courses} />
    </WrapperContainer>
  );
}
