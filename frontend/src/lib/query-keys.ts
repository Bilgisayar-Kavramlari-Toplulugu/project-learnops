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
};
