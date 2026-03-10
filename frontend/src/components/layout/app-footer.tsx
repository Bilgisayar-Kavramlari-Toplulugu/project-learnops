import { ExternalLink, Github, Linkedin, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
      { label: "Kurslar", href: routes.courses },
    ],
  },
  {
    title: "Topluluk",
    links: [
      { label: "Acik Kaynak", href: "#" },
      { label: "Cloud-DevOps", href: "#" },
      { label: "Gelistiriciler", href: "#" },
    ],
  },
  {
    title: "Bizi Takip Et",
    links: [
      { label: "GitHub", href: "https://github.com", icon: Github, external: true },
      { label: "YouTube", href: "https://youtube.com", icon: Youtube, external: true },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com",
        icon: Linkedin,
        external: true,
      },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const Icon = link.icon;

  const className = cn(
    "group inline-flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-300",
    link.external && "text-slate-700 dark:text-slate-200",
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        <span className="inline-flex items-center gap-2">
          {Icon ? <Icon className="size-4" /> : null}
          {link.label}
        </span>
        <ExternalLink className="size-3.5 opacity-60 transition group-hover:opacity-90" />
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon className="size-4" /> : null}
        {link.label}
      </span>
    </Link>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-2 rounded-2xl border border-blue-100/80 bg-white/80 px-4 py-4 text-xs text-slate-500 shadow-sm shadow-blue-100/30 sm:px-5 dark:border-slate-700/80 dark:bg-slate-900/72 dark:text-slate-400 dark:shadow-black/20">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <section className="rounded-2xl border border-blue-100/70 bg-white/85 p-3.5 dark:border-slate-700 dark:bg-slate-900/65">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">LearnOps</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Gercek projeler icin modern ogrenme ve operasyon paneli.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-900/30 dark:text-emerald-300">
              Open Source
            </span>
            <span className="rounded-lg border border-sky-100 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 dark:border-sky-900/70 dark:bg-sky-900/30 dark:text-sky-300">
              Cloud-DevOps
            </span>
          </div>
        </section>

        {footerColumns.map((column) => (
          <section
            key={column.title}
            className="rounded-2xl border border-blue-100/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
              {column.title}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {column.links.map((link) => (
                <FooterLinkItem key={link.label} link={link} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-blue-100/80 pt-3 dark:border-slate-700/80">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {currentYear} LearnOps. Tum haklari saklidir.
        </p>
        <div className="flex items-center gap-1.5">
          <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-900/30 dark:text-emerald-300">
            UI Ready
          </span>
          <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:border-amber-900/70 dark:bg-amber-900/30 dark:text-amber-300">
            API Waiting
          </span>
        </div>
      </div>
    </footer>
  );
}
