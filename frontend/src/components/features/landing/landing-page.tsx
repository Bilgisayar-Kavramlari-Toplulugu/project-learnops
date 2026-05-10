import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/features/landing/hero-section";
import { AudienceSection } from "@/components/features/landing/audience-section";
import { BentoGrid } from "@/components/features/landing/bento-grid";
import { CoursesSection } from "@/components/features/landing/courses-section";
import { StepsSection } from "@/components/features/landing/steps-section";
import { CtaSection } from "@/components/features/landing/cta-section";
import { TeamPreviewSection } from "@/components/features/landing/team-preview-section";
import type { Course } from "@/types";

interface LandingPageProps {
  courses: Course[];
  initialSection?: string;
}

export default function LandingPage({ courses, initialSection }: LandingPageProps) {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-4">
        <SiteHeader initialSection={initialSection} />
        <HeroSection />
        <BentoGrid />
        <AudienceSection />
        <StepsSection />
        <CoursesSection courses={courses} />
        <CtaSection />
        <TeamPreviewSection />
      </div>
    </main>
  );
}
