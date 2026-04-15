export const routes = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
  courses: "/courses",
  profile: "/profile",
  courseDetail: (slug: string) => `/courses/${slug}`,
  section: (slug: string, sectionIdStr: string) => `/courses/${slug}/sections/${sectionIdStr}`,
} as const;
