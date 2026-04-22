import LandingPage from "@/components/features/landing/landing-page";
import { getCourses } from "@/lib/fetchCourses";

export default async function Home() {
  const courses = await getCourses();
  return <LandingPage courses={courses} />;
}
