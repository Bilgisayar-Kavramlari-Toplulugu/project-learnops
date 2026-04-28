import { Course, CourseDetail, CourseListResponse } from "@/types";

// Server-side fetch for SSG build time and server components.
// BACKEND_INTERNAL_URL is called directly; browser proxy (/api) is not used.
const backendBase = () =>
  (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Typed error for backend HTTP responses.
 * Allows safe status access via `instanceof`.
 */
export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
  ) {
    super(`Backend error ${status}: ${path}`);
    this.name = "BackendError";
  }
}

async function serverGet<T>(path: string): Promise<T> {
  const res = await fetch(`${backendBase()}/v1${path}`, {
    next: { revalidate: false },
  });
  if (!res.ok) throw new BackendError(res.status, path);
  return res.json() as Promise<T>;
}

// GET /courses  (BE-14)
// Backend returns { items, page, limit, total } and we unwrap items.
// Courses with is_published=false are filtered on the backend.
export async function getCourses(): Promise<Course[]> {
  try {
    const response = await serverGet<CourseListResponse>("/courses");
    return response.items;
  } catch {
    return [];
  }
}

// GET /courses/{slug}  (BE-14)
// Backend returns 404 for missing slugs, so we return null.
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    return await serverGet<CourseDetail>(`/courses/${slug}`);
  } catch (err: unknown) {
    // Keep build resilient when backend is down or returns 404/5xx.
    console.error("Build-time fetch failed for slug:", slug, err);
    return null;
  }
}
// TODO [FE-12]: getEnrolledCourses backend entegrasyonu tamamlandığında
// gerçek API çağrısıyla değiştirilecek.
// TODO [Backend Integration]: try/catch eklenecek, hata durumunda error boundary
// veya fallback UI tanımlanmalı. Bu bir bloker olacak — entegrasyon sprint'ine gelince gözden geçirilmeli.
export async function getEnrolledCourses(): Promise<Course[]> {
  return [];
}
