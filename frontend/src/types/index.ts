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

export interface DashboardSuggestion {
  title: string;
  level: string;
  icon: LucideIcon;
}

// ─── Course Listing Types ─────────────────────────────────────────────────────

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
}
