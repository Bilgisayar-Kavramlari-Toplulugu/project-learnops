import type {
  DashboardUser,
  LearningPath,
  NotificationItem,
  UpcomingExam,
  WorkspaceOption,
} from "@/shared/types";

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

export interface DashboardStatsResponse {
  streakDays: number;
  rankPoints: number;
  rankLabel: string;
}

export interface DashboardOverviewResponse {
  user: DashboardUser;
  learningPath: LearningPath;
  courses: DashboardCourseResponse[];
  upcomingExam: UpcomingExam;
  stats: DashboardStatsResponse;
  suggestion: DashboardSuggestionResponse;
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
  notifications: NotificationItem[];
}
