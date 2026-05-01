import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

const steps = [
  { n: "01", title: "Giriş yap", desc: "Google, GitHub veya LinkedIn ile saniyeler içinde." },
  { n: "02", title: "Bir kursa başla", desc: "Linux'tan mı? Docker'dan mı? Sen seç." },
  { n: "03", title: "Bölümleri bitir", desc: "Quizleri çöz, ilerlemen kaydedilsin." },
] as const;

export function StepsSection() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 pb-16">
      <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Nasıl çalışır
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Üç adımda içerideyim.</h2>
          </div>

          <Link
            href="https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-3.5" />
            Katkı vermek istiyorum
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="relative mt-8 grid gap-6 sm:grid-cols-3">
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block"
            aria-hidden
          />

          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="flex size-12 items-center justify-center rounded-full border border-border/50 bg-background text-sm font-bold text-primary">
                {s.n}
              </div>
              <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}