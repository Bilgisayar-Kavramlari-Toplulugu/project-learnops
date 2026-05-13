import type { CourseSection, SectionProgressItem } from "@/types";

export function getNextIncompleteSection(
  sections: CourseSection[],
  progressSections: SectionProgressItem[] = [],
) {
  const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index);
  const completedIds = new Set(
    progressSections
      .filter((sectionProgress) => sectionProgress.completed)
      .map((sectionProgress) => sectionProgress.section_id_str),
  );

  return (
    sortedSections.find((section) => !completedIds.has(section.section_id_str)) ??
    sortedSections[sortedSections.length - 1] ??
    null
  );
}
