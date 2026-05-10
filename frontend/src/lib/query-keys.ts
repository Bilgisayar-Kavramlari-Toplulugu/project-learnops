export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    detail: (slug: string) => [...queryKeys.courses.all, "detail", slug] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    overview: () => [...queryKeys.dashboard.all, "overview"] as const,
  },
  progress: {
    all: ["progress"] as const,
    byCourse: (slug: string) => [...queryKeys.progress.all, slug] as const,
  },
  quiz: {
    all: ["quiz"] as const,
    meta: (slug: string) => ["quiz", "meta", slug] as const,
    session: (quizId: string) => ["quiz", "session", quizId] as const,
    history: (quizId: string) => ["quiz", "history", quizId] as const,
  },
  enrollments: {
    all: ["enrollments"] as const,
    list: () => [...queryKeys.enrollments.all, "list"] as const,
  },
};
