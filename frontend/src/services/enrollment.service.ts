// services/enrollment.service.ts
import { api } from "@/lib/api";
import type { EnrolledCourseItem, EnrollmentListResponse } from "@/types";

export async function getEnrolledCourses(): Promise<EnrolledCourseItem[]> {
  const response = await api.get<EnrollmentListResponse>("/enrollments");
  return response.data.items;
}

export async function enrollCourse(courseId: string): Promise<void> {
  await api.post("/enrollments", { course_id: courseId });
}