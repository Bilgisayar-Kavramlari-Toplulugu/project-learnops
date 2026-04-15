import { getCourses } from "@/lib/fetchCourses";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import CoursesClient from "@/components/features/courses/courses-client";

export default async function MyCoursesPage() {
  const courses = await getCourses();

  return (
    <WrapperContainer>
      <CoursesClient courses={courses} />
    </WrapperContainer>
  );
}
