import { SiteHeader } from "@/components/layout/site-header";
import { AppFooter } from "@/components/layout/app-footer";
import { HeroSection } from "@/components/features/landing/hero-section";
import { AudienceSection } from "@/components/features/landing/audience-section";
import { BentoGrid } from "@/components/features/landing/bento-grid";
import { StepsSection } from "@/components/features/landing/steps-section";
import { CtaSection } from "@/components/features/landing/cta-section";

interface LandingPageProps {
  initialSection?: string;
}

export default function LandingPage({ initialSection }: LandingPageProps) {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-4">
        <SiteHeader initialSection={initialSection} />
        <HeroSection />
        <BentoGrid />
        <AudienceSection />
        <StepsSection />
        <CtaSection />
        <AppFooter />
      </div>
    </main>
  );
}
