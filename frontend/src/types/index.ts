import type { LucideIcon } from "lucide-react";

export interface DashboardUser {
  name: string;
  email: string;
  role: string;
  initials?: string;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface LearningPath {
  title: string;
  progress: number;
  nextStep: string;
}

export interface CourseCardItem {
  id: string;
  title: string;
  description: string;
  completedLessons: number;
  totalLessons: number;
  level: string;
  progress: number;
  icon: LucideIcon;
  progressTone: "emerald" | "blue" | "indigo";
}

export interface UpcomingExam {
  title: string;
  nextAttempt: string;
  readiness: number;
  level: string;
}

export interface DashboardSuggestion {
  title: string;
  level: string;
  icon: LucideIcon;
}
