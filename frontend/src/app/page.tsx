export const dynamic = "force-dynamic";

import LandingPage from "@/components/features/landing/landing-page";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
  }>;
}) {
  const { section } = await searchParams;

  return <LandingPage initialSection={section} />;
}
