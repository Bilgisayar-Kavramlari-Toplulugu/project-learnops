import {
  Compass,
  ExternalLink,
  Github,
  Terminal,
  Code2,
  BookOpen,
  FileText,
  Hash,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";

const currentYear = new Date().getFullYear();

interface FooterLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "Ana Sayfa", href: routes.dashboard },
      { label: "Tüm Kurslar", href: routes.courses },
      { label: "Kurslarım", href: routes.myCourses },
      { label: "Profilim", href: routes.profile },
      { label: "Ekibimiz", href: routes.team },
    ],
  },
  {
    title: "Öğrenme Kaynakları",
    links: [
      { label: "DevOps Roadmap", href: "https://roadmap.sh/devops", icon: Compass, external: true },
      { label: "Linux Journey", href: "https://linuxjourney.com", icon: Terminal, external: true },
      {
        label: "Git Rehberi (TR)",
        href: "https://git-scm.com/book/tr/v2",
        icon: BookOpen,
        external: true,
      },
      { label: "Docker Docs", href: "https://docs.docker.com", icon: Code2, external: true },
    ],
  },
  {
    title: "Araçlar & Faydalı",
    links: [
      {
        label: "Git Cheat Sheet",
        href: "https://training.github.com/downloads/github-git-cheat-sheet.pdf",
        icon: FileText,
        external: true,
      },
      { label: "Regex101", href: "https://regex101.com", icon: Hash, external: true },
      {
        label: "Topluluk Website",
        href: "https://bilgisayarkavramlari.com",
        icon: Globe,
        external: true,
      },
      {
        label: "Topluluk Github",
        href: "https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops",
        icon: Github,
        external: true,
      },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const Icon = link.icon;

  const className = cn(
    "group flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-300",
    link.external && "text-slate-700 dark:text-slate-300",
  );

  const content = (
    <>
      <span className="flex items-center gap-2">
        {Icon ? <Icon className="size-4" /> : null}
        {link.label}
      </span>
      {link.external && (
        <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
      )}
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer noopener" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-4 rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-4 text-xs text-slate-500 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <section className="flex flex-col justify-between">
          <div>
            <Logo className="h-8 w-auto" />
            <p className="mt-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              Modern öğrenme ve operasyon paneli. Kendini geliştir, topluluğa katıl.
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Open Source
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
                Community Driven
              </span>
            </div>
          </div>
        </section>

        {footerColumns.map((column) => (
          <section key={column.title}>
            <p className="px-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
              {column.title}
            </p>
            <div className="mt-2 flex flex-col gap-0.5">
              {column.links.map((link) => (
                <FooterLinkItem key={link.label} link={link} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 border-t border-slate-200/50 pt-3 dark:border-slate-800/50">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          © {currentYear} LearnOps
        </p>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          <a
            href="https://bilgisayarkavramlari.com"
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            Bilgisayar Kavramları Topluluğu
          </a>
        </p>
      </div>
    </footer>
  );
}
