import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// Content directory resolution
// In Docker: content is mounted at /app/content (process.cwd()/content)
// In local dev: content is at ../content relative to frontend/
// ---------------------------------------------------------------------------
function getContentDir(): string {
  const dockerPath = path.join(process.cwd(), "content");
  if (fs.existsSync(dockerPath)) return dockerPath;
  return path.join(process.cwd(), "..", "content");
}

export interface SectionItem {
  id: string;
  title: string;
  order_index: number;
  filename: string;
}

export interface SectionContent {
  frontmatter: SectionItem;
  content: string;
  allSections: SectionItem[];
  prevSection: SectionItem | null;
  nextSection: SectionItem | null;
}

// ---------------------------------------------------------------------------
// Returns all sections for a course, sorted by order_index
// ---------------------------------------------------------------------------
export function getAllCourseSections(slug: string): SectionItem[] {
  const sectionsDir = path.join(getContentDir(), "courses", slug, "sections");
  if (!fs.existsSync(sectionsDir)) return [];

  return fs
    .readdirSync(sectionsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(sectionsDir, filename), "utf8");
      const { data } = matter(raw);
      return {
        id: String(data.id ?? ""),
        title: String(data.title ?? filename),
        order_index: Number(data.order_index ?? data.order ?? 0),
        filename,
      };
    })
    .sort((a, b) => a.order_index - b.order_index);
}

// ---------------------------------------------------------------------------
// Returns MDX content + neighbors for a single section
// ---------------------------------------------------------------------------
export function getSectionContent(slug: string, sectionIdStr: string): SectionContent | null {
  const sectionsDir = path.join(getContentDir(), "courses", slug, "sections");
  if (!fs.existsSync(sectionsDir)) return null;

  const files = fs.readdirSync(sectionsDir).filter((f) => f.endsWith(".mdx"));

  let targetFile: string | null = null;
  for (const filename of files) {
    const raw = fs.readFileSync(path.join(sectionsDir, filename), "utf8");
    const { data } = matter(raw);
    if (String(data.id) === sectionIdStr) {
      targetFile = filename;
      break;
    }
  }

  if (!targetFile) return null;

  const raw = fs.readFileSync(path.join(sectionsDir, targetFile), "utf8");
  const { data, content } = matter(raw);

  const allSections = getAllCourseSections(slug);
  const currentIndex = allSections.findIndex((s) => s.id === sectionIdStr);

  return {
    frontmatter: {
      id: String(data.id ?? ""),
      title: String(data.title ?? ""),
      order_index: Number(data.order_index ?? data.order ?? 0),
      filename: targetFile,
    },
    content,
    allSections,
    prevSection: currentIndex > 0 ? allSections[currentIndex - 1] : null,
    nextSection: currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null,
  };
}

// ---------------------------------------------------------------------------
// Returns all {slug, section_id_str} pairs — used by generateStaticParams
// ---------------------------------------------------------------------------
export function getAllSectionParams(): {
  slug: string;
  section_id_str: string;
}[] {
  const coursesDir = path.join(getContentDir(), "courses");
  if (!fs.existsSync(coursesDir)) return [];

  const params: { slug: string; section_id_str: string }[] = [];

  for (const slug of fs.readdirSync(coursesDir)) {
    const stat = fs.statSync(path.join(coursesDir, slug));
    if (!stat.isDirectory()) continue;

    for (const section of getAllCourseSections(slug)) {
      if (section.id) {
        params.push({ slug, section_id_str: section.id });
      }
    }
  }

  return params;
}
