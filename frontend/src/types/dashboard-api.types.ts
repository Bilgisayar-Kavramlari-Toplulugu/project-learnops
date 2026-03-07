import type {
  DashboardUser,
  LearningPath,
  UpcomingExam,
} from "@/types";

export interface DashboardCourseResponse {
  id: string;
  title: string;
  description: string;
  completedLessons: number;
  totalLessons: number;
  level: string;
  progress: number;
}

export interface DashboardSuggestionResponse {
  id?: string;
  title: string;
  level: string;
}

export interface DashboardOverviewResponse {
  user: DashboardUser;
  learningPath: LearningPath;
  courses: DashboardCourseResponse[];
  upcomingExam: UpcomingExam;
  suggestion: DashboardSuggestionResponse;
}
