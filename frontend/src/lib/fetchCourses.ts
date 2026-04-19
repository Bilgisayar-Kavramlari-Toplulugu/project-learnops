import { Course, CourseDetail, CourseListResponse } from "@/types";

// Server-side fetch — SSG build time ve server component'larda kullanılır.
// BACKEND_INTERNAL_URL doğrudan çağrılır; browser proxy'si (/api) pass edilmez.
const backendBase = () =>
  (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Backend HTTP hataları için typed error.
 * Hata mesajının regex ile parse edilmesi yerine `instanceof` ile
 * status koduna güvenli erişim sağlar.
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
    next: { revalidate: 60 }, // 60sn ISR — statik içerik sık değişmez
  });
  if (!res.ok) throw new BackendError(res.status, path);
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
    // Build sırasında backend yoksa veya 404/5xx gelirse çökme, null dön.
    console.error("Build-time fetch failed for slug:", slug, err);
    return null;
  }
}
