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
export interface DashboardCourseProgress {
  course_id: string;
  course_slug: string;
  course_title: string;
  course_category: string | null;
  course_difficulty: string | null;
  duration_minutes: number | null;
  last_activity_at: string | null;
  progress_percent: number;
  completed_sections: number;
  total_sections: number;
}
export interface DashboardInProgressCourse {
  course_id: string;
  title: string;
  slug: string;
  progress_percent: number;
  last_section_id_str: string | null;
  last_section_title: string | null;
}
export interface DashboardLastQuizResult {
  quiz_id: string;
  course_title: string;
  score: number;
  total: number;
  passed: boolean;
  submitted_at: string;
}
export interface DashboardSummaryResponse {
  display_name: string;
  avatar_type: string | null;
  in_progress_courses: DashboardInProgressCourse[];
  completed_course_count: number;
  last_quiz_result: DashboardLastQuizResult | null;
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
export interface DashboardStatSummaryItem {
  key: string;
  value: string;
  label: string;
  description?: string | null;
}
export interface DashboardOverviewResponse {
  stats: {
    enrolled_courses: number;
    completed_courses: number;
    average_progress_percent: number;
  };
  courses: DashboardCourseProgress[];
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
