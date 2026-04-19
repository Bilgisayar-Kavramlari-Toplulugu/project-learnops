import { Course, CourseDetail, CourseSection } from "@/types";
import course_list from "@/data/fake-courses";
import section_list from "@/data/fake-sections";

// TODO [Alper-Suleyman] return value will be refactored after the backend enpoints are implemented
export async function getCourses(): Promise<Course[]> {
  return course_list;
}

// TODO [Alper-Suleyman] return value will be refactored after the backend enpoints are implemented
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const mockCourse = course_list.find((course) => course.slug === slug);
  if (!mockCourse) return null;

  const mockSections: CourseSection[] = section_list.filter(
    (section) => section.course_id === mockCourse.id,
  );

  return {
    ...mockCourse,
    sections: mockSections,
  };
}

<<<<<<< HEAD
// TODO [Alper-Suleyman] return value will be refactored after the backend enpoints are implemented. This just simulates the API call as it returns an empty array for now to be able to show the empty state in the UI. Once the backend is implemented, this function will fetch the actual enrolled courses of the user.
=======
// TODO [FE-12]: getEnrolledCourses backend entegrasyonu tamamlandığında
// gerçek API çağrısıyla değiştirilecek.
>>>>>>> 887e81d68c7209921b0d85b9ba269a0d2726a58f
export async function getEnrolledCourses(): Promise<Course[]> {
  return [];
}
