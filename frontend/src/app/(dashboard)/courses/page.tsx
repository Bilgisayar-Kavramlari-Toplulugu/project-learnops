import CoursesClient from "@/components/features/courses/courses-client";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import course_list from "@/data/fake-courses";

/* async function getCourses() {
  return fetch("https://api.example.com/courses", {
    cache: "force-cache",
  }).then((res) => res.json());
} */

export default async function CoursesPage() {
  // const courses = await getCourses();

  return (
    <WrapperContainer>
      <CoursesClient courses={course_list} />
    </WrapperContainer>
  );
}
