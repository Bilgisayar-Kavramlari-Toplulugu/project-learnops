import type { CourseCardItem } from "@/shared/types";
import {
  dashboardSidebarItems,
  getCourseUiMeta,
  suggestionDefaultIcon,
} from "@/modules/dashboard/config/dashboard-ui.config";
import type { DashboardOverviewResponse } from "@/modules/dashboard/types/dashboard-api.types";
import type { DashboardScreenData } from "@/modules/dashboard/types/dashboard-view.types";

function mapCourses(courses: DashboardOverviewResponse["courses"]): CourseCardItem[] {
  return courses.map((course) => {
    const uiMeta = getCourseUiMeta(course.id);
    return {
      ...course,
      icon: uiMeta.icon,
      progressTone: uiMeta.progressTone,
    };
  });
}

function resolveActiveWorkspaceId(
  activeWorkspaceId: string,
  workspaces: DashboardOverviewResponse["workspaces"],
) {
  const exists = workspaces.some((workspace) => workspace.id === activeWorkspaceId);
  if (exists) {
    return activeWorkspaceId;
  }

  return workspaces[0]?.id ?? activeWorkspaceId;
}

export function mapDashboardOverviewToScreenData(
  overview: DashboardOverviewResponse,
): DashboardScreenData {
  return {
    user: overview.user,
    sidebarItems: dashboardSidebarItems,
    learningPath: overview.learningPath,
    courses: mapCourses(overview.courses),
    upcomingExam: overview.upcomingExam,
    streakDays: overview.stats.streakDays,
    rankPoints: overview.stats.rankPoints,
    rankLabel: overview.stats.rankLabel,
    suggestion: {
      ...overview.suggestion,
      icon: suggestionDefaultIcon,
    },
    workspaces: overview.workspaces,
    activeWorkspaceId: resolveActiveWorkspaceId(overview.activeWorkspaceId, overview.workspaces),
    notifications: overview.notifications,
  };
}
