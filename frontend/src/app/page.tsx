export const dynamic = "force-static";

import LandingPage from "@/components/features/landing/landing-page";
import { getCourses } from "@/lib/fetchCourses";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
  }>;
}) {
  const { section } = await searchParams;
  const courses = await getCourses();

  return <LandingPage courses={courses} initialSection={section} />;
}
