import Link from "next/link";
import { ArrowUpRight, BookOpenText, Clock3 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface ThemeDocsCardProps {
  title: string;
  summary: string;
  href: string;
  updatedLabel?: string;
  tags?: string[];
  className?: string;
}

export function ThemeDocsCard({
  title,
  summary,
  href,
  updatedLabel = "Updated recently",
  tags = [],
  className,
}: ThemeDocsCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-blue-100/90 bg-white/90 p-4 shadow-md shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20",
        className,
      )}
    >
      <header className="space-y-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
          <BookOpenText className="size-3.5" />
          Docs Template
        </p>
        <h3 className="text-lg leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{summary}</p>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <footer className="mt-4 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Clock3 className="size-3.5" />
          {updatedLabel}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition hover:text-blue-800 dark:text-sky-300 dark:hover:text-sky-200"
        >
          Open
          <ArrowUpRight className="size-4" />
        </Link>
      </footer>
    </article>
  );
}
