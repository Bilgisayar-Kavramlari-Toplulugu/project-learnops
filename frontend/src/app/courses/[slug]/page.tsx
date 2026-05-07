import { getCourseBySlug } from "@/lib/fetchCourses";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import CourseDetailClient from "@/components/features/courses/course-detail-client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("access_token"));

  if (!course) {
    notFound();
  }

  return (
    <WrapperContainer>
      <CourseDetailClient course={course} isAuthenticated={isAuthenticated} />
    </WrapperContainer>
  );
}
