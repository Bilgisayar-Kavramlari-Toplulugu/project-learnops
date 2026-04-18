import { Course, CourseDetail, CourseListResponse } from "@/types";

// Server-side fetch — SSG build time ve server component'larda kullanılır.
// BACKEND_INTERNAL_URL doğrudan çağrılır; browser proxy'si (/api) pass edilmez.
const backendBase = () =>
  (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function serverGet<T>(path: string): Promise<T> {
  const res = await fetch(`${backendBase()}/v1${path}`, {
    next: { revalidate: 60 }, // 60sn ISR — statik içerik sık değişmez
  });
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// GET /courses  (BE-14)
// Backend { items, page, limit, total } döndürür — items çıkarılır.
// is_published=false kurslar backend tarafından filtrelenir.
export async function getCourses(): Promise<Course[]> {
  try {
    const response = await serverGet<CourseListResponse>("/courses");
    return response.items;
  } catch {
    return [];
  }
}

// GET /courses/{slug}  (BE-14)
// Slug bulunamazsa backend 404 döner → null return edilir.
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    return await serverGet<CourseDetail>(`/courses/${slug}`);
  } catch (err: unknown) {
    const status = (err as { message?: string })?.message?.match(/\d+/)?.[0];
    if (status === "404") return null;
    throw err; // 5xx → build time'da surface et
  }
}
