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

// GET /courses/{slug}/sections/{section_id_str}
export interface SectionWithContent {
  id: number; // DB integer PK — matches backend SectionOut.id
  section_id_str: string;
  title: string;
  order_index: number;
  content: string | null;
}

// GET /courses paginated response wrapper
export interface CourseListResponse {
  items: Course[];
  page: number;
  limit: number;
  total: number;
}

// ─── Quiz Types ──────────────────────────────────────────────────────────────
// Backend contract: GET /courses/{slug}/quiz → QuizMeta
//                  POST /quizzes/{quizId}/attempts → QuizSession
//                  POST /quiz-attempts/{attemptId}/submit → QuizResultRaw

export interface QuizMeta {
  quiz_id: string;
  question_count: number;
  duration_seconds: number;
  pass_threshold: number;
}

export interface QuizOption {
  index: number; // "id" field'ı YOK — seçim ve karşılaştırma index ile yapılır
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizSession {
  id: string; // attempt_id — "session_id" değil
  quiz_id: string;
  started_at: string; // ISO 8601 — timer buradan hesaplanır
  duration_seconds: number;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  question_id: string;
  selected_index: number | null; // null = cevaplanmadı; tüm sorular payload'a dahil edilir
}

// POST /quiz-attempts/{attemptId}/submit payload
export interface QuizSubmitPayload {
  answers: QuizAnswer[]; // session_id YOK
}

// Submit response ham hali (correct_index dahil — submit sonrası açıklanır)
export interface QuizAnswerResultRaw {
  question_id: string;
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation?: string;
}

export interface QuizResultRaw {
  attempt_id: string;
  score: number;
  total_questions: number; // "total" değil
  passed: boolean;
  time_spent_secs: number; // "time_spent_seconds" değil
  answers: QuizAnswerResultRaw[];
}

// Frontend'de zenginleştirilmiş hali (soru metni + seçenekler eklenir)
export interface QuizAnswerResult extends QuizAnswerResultRaw {
  question_text: string;
  options: QuizOption[];
}

export interface QuizResult extends QuizResultRaw {
  quiz_id: string;
  answers: QuizAnswerResult[];
}

// GET /quiz-attempts?quiz_id={id} → dizi
export interface QuizAttemptHistoryItem {
  id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  submitted_at: string;
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
// ─── Enrollment Types ──────────────────────────────────────────────────────────

// GET /v1/enrollments → { items: EnrolledCourseItem[] }
export interface EnrolledCourseItem {
  id: string; // enrollment UUID
  course_id: string;
  enrolled_at: string; // ISO datetime
  completed_at: string | null;
  progress_percent: number; // DB: NUMERIC(5,2) — parseInt kullanma
  course: {
    id: string;
    slug: string;
    title: string;
    category: string | null;
    difficulty: string | null;
    duration_minutes: number | null;
    display_order: number | null;
  };
}

export interface EnrollmentListResponse {
  items: EnrolledCourseItem[];
}
