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

// ─── Course Listing Types ─────────────────────────────────────────────────────

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  section_id_str: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseDetail extends Course {
  sections: CourseSection[];
}
