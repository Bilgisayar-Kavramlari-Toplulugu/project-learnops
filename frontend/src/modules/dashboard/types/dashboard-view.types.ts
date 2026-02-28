import type {
  CourseCardItem,
  DashboardSuggestion,
  DashboardUser,
  LearningPath,
  NotificationItem,
  SidebarItem,
  UpcomingExam,
  WorkspaceOption,
} from "@/shared/types";

export interface DashboardScreenData {
  user: DashboardUser;
  sidebarItems: SidebarItem[];
  learningPath: LearningPath;
  courses: CourseCardItem[];
  upcomingExam: UpcomingExam;
  streakDays: number;
  rankPoints: number;
  rankLabel: string;
  suggestion: DashboardSuggestion;
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
  notifications: NotificationItem[];
}
