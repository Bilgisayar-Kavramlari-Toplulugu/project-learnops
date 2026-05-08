import { BookOpen, BookOpenCheck, House, UserRound } from "lucide-react";

import { routes } from "@/lib/routes";
import type { SidebarItem } from "@/types";

export const dashboardSidebarItems: SidebarItem[] = [
  {
    label: "Ana Sayfa",
    href: routes.dashboard,
    icon: House,
  },
  {
    label: "Tüm Kurslar",
    href: routes.courses,
    icon: BookOpen,
  },
  {
    label: "Kurslarım",
    href: routes.myCourses,
    icon: BookOpenCheck,
  },
  {
    label: "Profil",
    href: routes.profile,
    icon: UserRound,
    pinBottom: true,
  },
];
