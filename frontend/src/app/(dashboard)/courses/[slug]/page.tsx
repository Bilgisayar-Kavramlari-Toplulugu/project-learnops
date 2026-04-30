import { getCourseBySlug } from "@/lib/fetchCourses";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import CourseDetailClient from "@/components/features/courses/course-detail-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <WrapperContainer>
      <CourseDetailClient course={course} />
    </WrapperContainer>
  );
}
