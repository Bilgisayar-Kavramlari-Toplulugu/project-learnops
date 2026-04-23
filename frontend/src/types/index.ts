import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  pinBottom?: boolean;
}

export interface DashboardProfile {
  id: string;
  email: string;
  display_name: string;
  bio: string | null;
  avatar_type: string | null;
}

// ─── Dashboard Feature Types ──────────────────────────────────────────────────

export interface LearningPath {
  title: string;
  progress: number;
  nextStep: string;
}

export interface UpcomingExam {
  title: string;
  nextAttempt: string;
  readiness: number;
  level: string;
}

export type CourseProgressTone = "emerald" | "blue" | "indigo";

export interface CourseCardItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  level: string;
  progressTone: CourseProgressTone;
  icon: LucideIcon;
}

export interface DashboardSuggestion {
  title: string;
  level: string;
  icon: LucideIcon;
}

// ─── Course Listing Types (BE-14 şemasıyla senkronize) ───────────────────────

// GET /courses → CourseListResponse.items  (CourseListItem şeması)
// NOT: description intentional olarak yok (FR-07). Liste view'da title üzerinden
// arama yapılır; description yalnızca detay sayfasında gösterilir (FR-08).
export interface Course {
  slug: string;
  title: string;
  description?: string | null; // liste response'unda gelmez, tip uyumu için optional
  category: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  display_order: number | null;
}

// GET /courses/{slug} → SectionOut şeması
// TODO(BE-14): description backend SectionOut şemasına eklenmeli —
//   kurs detay sayfasında section açıklaması gösteriliyor.
export interface CourseSection {
  id: string;
  section_id_str: string;
  title: string;
  order_index: number;
  description?: string | null;
}

// GET /courses/{slug} → CourseDetail şeması
// BLOCKER(BE-14): id backend CourseDetail şemasına eklenmeli —
//   POST /enrollments { course_id } için zorunlu. Eksik olursa enrollment kırılır.
export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  display_order: number | null;
  sections: CourseSection[];
}

// GET /courses paginated response wrapper
export interface CourseListResponse {
  items: Course[];
  page: number;
  limit: number;
  total: number;
}

// ─── Section Progress Types ───────────────────────────────────────────────────

export interface SectionProgressItem {
  section_id_str: string;
  completed: boolean;
}

export interface SectionProgress {
  id: string;
  section_id_str: string;
  title: string;
  order_index: number;
  completed: boolean;
  completed_at: string | null;
}

export interface CourseProgress {
  course_id: string;
  course_slug: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percent: number;
  sections: SectionProgress[];
}
