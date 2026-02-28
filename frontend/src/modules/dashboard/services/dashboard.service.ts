import type {
  DashboardUser,
  LearningPath,
  NotificationItem,
  UpcomingExam,
  WorkspaceOption,
} from "@/shared/types";
import type {
  DashboardCourseResponse,
  DashboardOverviewResponse,
  DashboardStatsResponse,
  DashboardSuggestionResponse,
} from "@/modules/dashboard/types/dashboard-api.types";
import { apiClient } from "@/shared/lib/api/client";

const dashboardEndpoints = {
  user: "/users/me",
  learningPath: "/learning-paths/active",
  courses: "/courses/enrolled",
  upcomingExam: "/exams/upcoming",
  stats: "/progress/stats",
  suggestion: "/courses/suggestions/next",
  workspaces: "/workspaces",
  notifications: "/notifications",
} as const;

const EMPTY_USER: DashboardUser = {
  name: "",
  email: "",
  role: "",
  initials: "LO",
};

const EMPTY_LEARNING_PATH: LearningPath = {
  title: "Learning path not available yet",
  progress: 0,
  nextStep: "Waiting for backend data",
};

const EMPTY_UPCOMING_EXAM: UpcomingExam = {
  title: "No exam scheduled",
  nextAttempt: "-",
  readiness: 0,
  level: "-",
};

const EMPTY_STATS: DashboardStatsResponse = {
  streakDays: 0,
  rankPoints: 0,
  rankLabel: "-",
};

const EMPTY_SUGGESTION: DashboardSuggestionResponse = {
  title: "No suggestion yet",
  level: "-",
};

async function safeFetch<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

export async function getDashboardUser() {
  const response = await apiClient.get<DashboardUser>(dashboardEndpoints.user);
  return response.data;
}

export async function getLearningPath() {
  const response = await apiClient.get<LearningPath>(dashboardEndpoints.learningPath);
  return response.data;
}

export async function getEnrolledCourses() {
  const response = await apiClient.get<DashboardCourseResponse[]>(dashboardEndpoints.courses);
  return response.data;
}

export async function getUpcomingExam() {
  const response = await apiClient.get<UpcomingExam>(dashboardEndpoints.upcomingExam);
  return response.data;
}

export async function getDashboardStats() {
  const response = await apiClient.get<DashboardStatsResponse>(dashboardEndpoints.stats);
  return response.data;
}

export async function getDashboardSuggestion() {
  const response = await apiClient.get<DashboardSuggestionResponse>(dashboardEndpoints.suggestion);
  return response.data;
}

export async function getWorkspaces() {
  const response = await apiClient.get<WorkspaceOption[]>(dashboardEndpoints.workspaces);
  return response.data;
}

export async function getNotifications() {
  const response = await apiClient.get<NotificationItem[]>(dashboardEndpoints.notifications);
  return response.data;
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const [user, learningPath, courses, upcomingExam, stats, suggestion, workspaces, notifications] =
    await Promise.all([
      safeFetch(getDashboardUser, EMPTY_USER),
      safeFetch(getLearningPath, EMPTY_LEARNING_PATH),
      safeFetch(getEnrolledCourses, []),
      safeFetch(getUpcomingExam, EMPTY_UPCOMING_EXAM),
      safeFetch(getDashboardStats, EMPTY_STATS),
      safeFetch(getDashboardSuggestion, EMPTY_SUGGESTION),
      safeFetch(getWorkspaces, []),
      safeFetch(getNotifications, []),
    ]);

  return {
    user,
    learningPath,
    courses,
    upcomingExam,
    stats,
    suggestion,
    workspaces,
    activeWorkspaceId: workspaces[0]?.id ?? "",
    notifications,
  };
}

export async function markNotificationAsRead(notificationId: string) {
  await apiClient.patch(`${dashboardEndpoints.notifications}/${notificationId}/read`);
}

export async function markAllNotificationsAsRead() {
  await apiClient.patch(`${dashboardEndpoints.notifications}/read-all`);
}
