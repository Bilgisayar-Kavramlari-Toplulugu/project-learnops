import type {
  CourseCardItem,
  DashboardSuggestion,
  DashboardUser,
  LearningPath,
  SidebarItem,
  UpcomingExam,
} from "@/types";

export interface DashboardScreenData {
  user: DashboardUser;
  sidebarItems: SidebarItem[];
  learningPath: LearningPath;
  courses: CourseCardItem[];
  upcomingExam: UpcomingExam;
  suggestion: DashboardSuggestion;
}
