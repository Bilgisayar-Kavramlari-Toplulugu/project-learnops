import Link from "next/link";
import { ArrowRight, Github, Star, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const stack = [
  "Linux", "Docker", "Git", "Terraform",
  "Kubernetes", "CI/CD", "AWS", "Ansible",
] as const;

export function HeroSection() {
  return (
    <section className="pb-12 pt-16 sm:pt-20">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        {/* Sol: yazı */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" />
              Açık kaynak · Türkçe
            </span>
            <Link
              href="https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Github className="size-3" />
              GitHub'da yıldız ver
              <Star className="size-3" />
            </Link>
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            DevOps'u{" "}
            <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              birlikte
            </span>{" "}
            öğreniyoruz.
          </h1>

          <p className="mt-5 max-w-lg text-base text-muted-foreground">
            Bir grup geliştirici tarafından açık kaynak olarak yazılan,{" "}
            <span className="text-foreground">Türkçe</span> bir DevOps öğrenme
            platformu. Bölümler, quizler, kaldığın yerden devam — hepsi tek yerde.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button asChild className="h-11 rounded-full px-6">
              <Link href={routes.login}>
                Hemen başla <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full px-6">
              <Link href={routes.courses}>Kurslara göz at</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Ücretsiz · Reklamsız · Topluluk yönetiminde
          </p>
        </div>

        {/* Sağ: stack cloud */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="flex flex-wrap justify-center gap-2">
            {stack.map((s, i) => (
              <span
                key={s}
                className="rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur transition-all hover:scale-105 hover:border-primary/40 hover:text-foreground"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}