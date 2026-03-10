import {
  BookOpen,
  ClipboardCheck,
  Container,
  House,
  Settings,
  ShieldCheck,
  TerminalSquare,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/lib/routes";
import type { SidebarItem } from "@/types";

type CourseProgressTone = "emerald" | "blue" | "indigo";

interface CourseUiMeta {
  icon: LucideIcon;
  progressTone: CourseProgressTone;
}

const defaultCourseMeta: CourseUiMeta = {
  icon: BookOpen,
  progressTone: "blue",
};

const courseUiMetaById: Record<string, CourseUiMeta> = {
  "linux-bash": {
    icon: TerminalSquare,
    progressTone: "emerald",
  },
  docker: {
    icon: Container,
    progressTone: "blue",
  },
  "k8s-fundamentals": {
    icon: ShieldCheck,
    progressTone: "indigo",
  },
};

export const dashboardSidebarItems: SidebarItem[] = [
  {
    label: "Ana Sayfa",
    href: routes.dashboard,
    icon: House,
  },
  {
    label: "Kurslar",
    href: routes.courses,
    icon: BookOpen,
  },
  {
    label: "Sinavlar",
    href: routes.exams,
    icon: ClipboardCheck,
  },
  {
    label: "Profil",
    href: routes.profile,
    icon: UserRound,
  },
  {
    label: "Ayarlar",
    href: routes.settings,
    icon: Settings,
  },
];

export function getCourseUiMeta(courseId: string): CourseUiMeta {
  return courseUiMetaById[courseId] ?? defaultCourseMeta;
}

export const suggestionDefaultIcon: LucideIcon = Container;
