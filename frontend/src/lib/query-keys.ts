export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    overview: () => [...queryKeys.dashboard.all, "overview"] as const,
  },
  progress: {
    all: ["progress"] as const,
    byCourse: (slug: string) => [...queryKeys.progress.all, slug] as const,
  },
};
