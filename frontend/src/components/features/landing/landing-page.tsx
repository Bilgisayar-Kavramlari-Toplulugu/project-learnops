import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/features/landing/hero-section";
import { BentoGrid } from "@/components/features/landing/bento-grid";
import { StepsSection } from "@/components/features/landing/steps-section";
import { CtaSection } from "@/components/features/landing/cta-section";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-4">
        <SiteHeader />
        <HeroSection />
        <BentoGrid />
        <StepsSection />
        <CtaSection />
      </div>
    </main>
  );
}
