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
// TODO [FE-12]: getEnrolledCourses backend entegrasyonu tamamlandığında
// gerçek API çağrısıyla değiştirilecek.
// TODO [Backend Integration]: try/catch eklenecek, hata durumunda error boundary
// veya fallback UI tanımlanmalı. Bu bir bloker olacak — entegrasyon sprint'ine gelince gözden geçirilmeli.
export async function getEnrolledCourses(): Promise<Course[]> {
  return [];
}