import {
  AppWindow,
  CaseSensitive,
  FormInput,
  LifeBuoy,
  ListChecks,
  NotebookText,
  Rows2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { routes } from "@/lib/routes";

export interface SidebarComponentLink {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarSystemNote {
  label: string;
  value: string;
  toneClass: string;
}

export const sidebarComponentLinks: SidebarComponentLink[] = [
  {
    label: "Exam Component",
    description: "Sinav karti tasarimi",
    href: routes.uiKitExam,
    icon: ListChecks,
  },
  {
    label: "Docs Component",
    description: "Dokuman kart yapisi",
    href: routes.uiKitDocs,
    icon: NotebookText,
  },
  {
    label: "Form Component",
    description: "Field ve aksiyon yapisi",
    href: routes.uiKitForm,
    icon: FormInput,
  },
  {
    label: "Typography",
    description: "Baslik ve metin stilleri",
    href: routes.uiKitTypography,
    icon: AppWindow,
  },
  {
    label: "Modal Component",
    description: "Merkez dialog yapisi",
    href: routes.uiKitModal,
    icon: Rows2,
  },
  {
    label: "Input Component",
    description: "Input ve textarea stilleri",
    href: routes.uiKitInput,
    icon: CaseSensitive,
  },
];

export const sidebarSystemNotes: SidebarSystemNote[] = [
  {
    label: "Proxy",
    value: "Aktif",
    toneClass:
      "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-900/60",
  },
  {
    label: "API Mode",
    value: "Mock/Live",
    toneClass:
      "text-sky-700 bg-sky-50 border-sky-100 dark:text-sky-300 dark:bg-sky-900/25 dark:border-sky-900/60",
  },
];

export const helpAction = {
  href: routes.uiKitDocs,
  label: "Rehberi Ac",
  icon: LifeBuoy,
} as const;
