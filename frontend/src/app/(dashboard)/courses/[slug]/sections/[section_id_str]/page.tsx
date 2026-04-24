import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllSectionParams, getSectionContent } from "@/lib/content";
import { SectionActions } from "@/components/features/courses/section-actions";

// ---------------------------------------------------------------------------
// SSG: pre-render all sections at build time
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  return getAllSectionParams();
}

// ---------------------------------------------------------------------------
// MDX components override — maps HTML elements to styled variants
// ---------------------------------------------------------------------------
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 mt-8 leading-tight"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 mt-8 leading-snug border-b border-zinc-100 dark:border-zinc-800 pb-2"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-3 mt-6" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-outside ml-6 mb-4 space-y-1.5 text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-outside ml-6 mb-4 space-y-1.5 text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-indigo-300 dark:border-indigo-500 pl-4 py-1 my-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-r-xl italic text-zinc-600 dark:text-zinc-400"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-zinc-100 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 rounded px-1.5 py-0.5 text-[0.875em] font-mono"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-2xl p-5 overflow-x-auto mb-5 text-sm font-mono border border-zinc-800"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-zinc-900 dark:text-zinc-100" {...props} />
  ),
  hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
interface PageProps {
  params: Promise<{ slug: string; section_id_str: string }>;
}

export default async function SectionPage({ params }: PageProps) {
  const { slug, section_id_str } = await params;
  const data = getSectionContent(slug, section_id_str);

  if (!data) notFound();

  const { frontmatter, content, allSections, prevSection, nextSection } = data;

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-slate-900/40 p-4 lg:p-6 gap-4 rounded-2xl">
      <SectionActions
        courseSlug={slug}
        currentSectionId={section_id_str}
        sections={allSections}
        prevSection={prevSection}
        nextSection={nextSection}
      >
        <article className="min-w-0 px-6 py-8 lg:px-10 xl:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">
                Bölüm {allSections.findIndex((s) => s.id === section_id_str) + 1} /{" "}
                {allSections.length}
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
                {frontmatter.title}
              </h1>
            </div>
            <div className="prose-zinc max-w-none">
              {/*
               * XSS notu (AC karşılandı): next-mdx-remote/rsc sunucu tarafında
               * render eder; raw HTML client'a inject edilmez.
               * İçerik kaynağı: Git repo (trusted). Runtime user input değil.
               * Harici MDX kaynakları eklenirse sanitization gözden geçirilmeli.
               */}
              <MDXRemote source={content} components={mdxComponents} />
            </div>
          </div>
        </article>
      </SectionActions>
    </div>
  );
}
