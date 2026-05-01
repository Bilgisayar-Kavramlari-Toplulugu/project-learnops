import Link from "next/link";
import { ArrowRight, Github, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function CtaSection() {
  return (
    <section className="pb-12">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-fuchsia-500/5 p-8 sm:p-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-fuchsia-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Birlikte öğrenmek, yalnız öğrenmekten{" "}
            <span className="text-primary">çok daha eğlenceli.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            LearnOps açık kaynak. Hesabını aç, öğrenmeye başla — ya da repo&apos;ya dalıp sen de bir
            bölüm yaz, bir quiz ekle, bir hatayı düzelt. Ekibe katıl.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 rounded-full px-6">
              <Link href={routes.login}>
                Öğrenmeye başla <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full px-6">
              <Link
                href="https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-3.5" />
                Repo&apos;yu incele
              </Link>
            </Button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="size-3.5 fill-rose-500 text-rose-500" />
              topluluk emeği
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
