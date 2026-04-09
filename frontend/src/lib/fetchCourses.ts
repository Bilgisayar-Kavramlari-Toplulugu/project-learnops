import { Course, CourseDetail, CourseSection } from "@/types";
import course_list from "@/data/fake-courses";
import section_list from "@/data/fake-sections";

export async function getCourses(): Promise<Course[]> {
  // MOCK
  return course_list;

  // REAL API
  /*
  const isServer = typeof window === "undefined";
  const backendInternal =
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
  const baseUrl = `${backendInternal}/v1`;

  try {
    const res = await fetch(`${baseUrl}/courses`, {
      cache: "force-cache",
      ...(isServer ? {} : { credentials: "include" }),
    });

    if (!res.ok) {
      console.warn(`[getCourses] Failed to fetch. Status: ${res.status}`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.warn("[getCourses] Fetch error:", error);
    return [];
  }
  */
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  // MOCK
  const mockCourse = course_list.find((course) => course.slug === slug);
  if (!mockCourse) return null;

  const mockSections: CourseSection[] = section_list
    .filter((section) => section.course_id === mockCourse.id)
    .sort((a, b) => a.order_index - b.order_index)
    .map((section) => ({
      ...section,
      description: section.description ?? null,
      is_published: true,
    }));

  return {
    ...mockCourse,
    sections: mockSections,
  };

  // REAL API
  /*
  const isServer = typeof window === "undefined";
  const backendInternal =
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
  const baseUrl = `${backendInternal}/v1`;

  try {
    const res = await fetch(`${baseUrl}/courses/${slug}`, {
      cache: "force-cache",
      ...(isServer ? {} : { credentials: "include" }),
    });

    if (!res.ok) {
      console.warn(`[getCourseBySlug] Failed to fetch. Status: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("[getCourseBySlug] Fetch error:", error);
    return null;
  }
  */
}
