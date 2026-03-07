import type { DashboardUser } from "@/types";
import type { DashboardOverviewResponse } from "@/types/dashboard-api.types";

export const dashboardStarterUser: DashboardUser = {
  name: "LearnOps User",
  email: "user@learnops.local",
  role: "user",
};

export const dashboardStarterOverview: DashboardOverviewResponse = {
  user: dashboardStarterUser,
  learningPath: {
    title: "Ogrenme Yolu",
    progress: 0,
    nextStep: "Linux Bash modulunu tamamla",
  },
  courses: [],
  upcomingExam: {
    title: "Linux Fundamentals Quiz",
    nextAttempt: "-",
    readiness: 0,
    level: "Baslangic",
  },
  suggestion: {
    title: "Docker tekrar oturumu",
    level: "Orta",
  },
};
