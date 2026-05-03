import { Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { TeamSection } from "@/components/features/team/team-section";

export const metadata = {
  title: "Ekip — LearnOps",
};

export default function TeamPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* subtle glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-4">
        <SiteHeader />

        <section className="pb-12 pt-16 text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur px-3 py-1 text-xs font-medium text-primary shadow-sm">
            <Sparkles className="size-3" />
            Ekibi tanı
          </div>

          {/* title */}
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              Üreten, paylaşan, sürekli geliştiren ekip
            </span>
          </h1>

          {/* description */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-muted-foreground/90 sm:text-base">
              Açık kaynak ruhuyla hareket eden, üreten ve paylaşan bir ekip.
            </p>
            <p className="text-sm text-muted-foreground/70 sm:text-base">
              Fikirleri ürüne dönüştüren, kodla geleceği şekillendiren ekip.
            </p>
          </div>
        </section>

        <TeamSection />
      </div>
    </main>
  );
}
