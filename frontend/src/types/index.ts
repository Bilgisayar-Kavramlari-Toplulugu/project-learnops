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
  role: string;
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
