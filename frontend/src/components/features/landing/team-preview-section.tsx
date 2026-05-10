import { Sparkles } from "lucide-react";

import { TeamSection } from "@/components/features/team/team-section";

export function TeamPreviewSection() {
  return (
    <section className="pb-12">
      <div className="pb-8 pt-4 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
          <Sparkles className="size-3" />
          Ekibi tanı
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            Üreten, paylaşan, sürekli geliştiren ekip
          </span>
        </h2>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground/90 sm:text-base">
            Açık kaynak ruhuyla hareket eden, üreten ve paylaşan bir ekip.
          </p>
          <p className="text-sm text-muted-foreground/70 sm:text-base">
            Fikirleri ürüne dönüştüren, kodla geleceği şekillendiren ekip.
          </p>
        </div>
      </div>

      <div
        id="ekip"
        className="relative left-1/2 w-screen max-w-6xl -translate-x-1/2 scroll-mt-20 px-5"
      >
        <TeamSection className="gap-4 min-[900px]:grid-cols-4" />
      </div>
    </section>
  );
}
