import LandingPage from "@/components/features/landing/landing-page";
import { getLandingCourses } from "@/lib/fetchLandingCourses";

export default async function Home() {
  const feed = await getLandingCourses();
  return <LandingPage feed={feed} />;
}
