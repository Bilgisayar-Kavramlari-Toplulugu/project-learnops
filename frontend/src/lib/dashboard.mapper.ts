import type { CourseCardItem } from "@/types";
import {
  dashboardSidebarItems,
  getCourseUiMeta,
  suggestionDefaultIcon,
} from "@/lib/dashboard-ui.config";
import type { DashboardOverviewResponse } from "@/types/dashboard-api.types";
import type { DashboardScreenData } from "@/types/dashboard-view.types";

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

export function mapDashboardOverviewToScreenData(
  overview: DashboardOverviewResponse,
): DashboardScreenData {
  return {
    user: overview.user,
    sidebarItems: dashboardSidebarItems,
    learningPath: overview.learningPath,
    courses: mapCourses(overview.courses),
    upcomingExam: overview.upcomingExam,
    suggestion: {
      ...overview.suggestion,
      icon: suggestionDefaultIcon,
    },
  };
}
