import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  GraduationCap,
  Layers3,
  LogIn,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/routes";
import { Course } from "@/types";

// ── Nav ────────────────────────────────────────────────────────────────────

const navItems = [
  { href: "#neden", label: "Neden LearnOps" },
  { href: "#kurslar", label: "Kurslar" },
  { href: "#nasil-calisir", label: "Nasıl çalışır" },
] as const;

function LandingHeader() {
  return (
    <header className="relative z-30 mb-6 sm:mb-8">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={routes.root}
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            <BookOpen className="size-4" />
          </Link>
          <div className="flex flex-col">
            <Link
              href={routes.root}
              className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
              LearnOps
            </Link>
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Sparkles className="size-3 text-primary" />
              DevOps için düzgün bir öğrenme zemini
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={routes.login}>
              <LogIn className="size-3.5" />
              Giriş Yap
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden rounded-full sm:flex">
            <Link href={routes.login}>Öğrenmeye Başla</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ── Course Card ────────────────────────────────────────────────────────────

const difficultyLabel: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

const difficultyVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "destructive",
};

function CourseCard({ course }: { course: Course }) {
  const difficulty = course.difficulty?.toLowerCase() ?? "";
  const label = difficultyLabel[difficulty] ?? course.difficulty ?? "—";
  const variant = difficultyVariant[difficulty] ?? "outline";

  return (
    <Link
      href={routes.login}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant={variant} className="shrink-0 text-xs">
          {label}
        </Badge>
        {course.duration_minutes && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {course.duration_minutes} Bölüm
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-card-foreground group-hover:text-primary transition-colors">
        {course.title}
      </h3>

      {course.category && (
        <p className="mt-auto pt-4 text-xs text-muted-foreground">{course.category}</p>
      )}
    </Link>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────

const pillars = [
  {
    title: "Türkçe ve net anlatım",
    description:
      "Parçalı blog zincirleri yerine başlangıçtan uygulamaya uzanan temiz bir öğrenme akışı.",
    icon: GraduationCap,
  },
  {
    title: "DevOps odaklı başlıklar",
    description: "Linux, Docker, Git, Terraform ve benzeri konular aynı platform diliyle ilerler.",
    icon: Compass,
  },
  {
    title: "Takip edilebilir ilerleme",
    description: "Bölüm, quiz ve ilerleme mantığı sayesinde nerede olduğun hep görünür kalır.",
    icon: Gauge,
  },
] as const;

const audienceCards = [
  {
    title: "Sıfırdan başlayanlar",
    description: "Nereden başlayacağını bilmiyorsan sana düzgün bir ilk rota verir.",
    icon: Target,
  },
  {
    title: "Kendini toparlamak isteyenler",
    description:
      "Dağılmış notları ve yarı kalmış kaynakları tek bir düzende toplamana yardım eder.",
    icon: Layers3,
  },
  {
    title: "Takım içi öğrenme isteyenler",
    description: "Ortak referans dili olan bir öğrenme zemini sunar.",
    icon: Users,
  },
] as const;

const journeySteps = [
  {
    step: "01",
    title: "Giriş yap",
    description: "Google, GitHub veya LinkedIn ile dakikalar içinde platforma geç.",
  },
  {
    step: "02",
    title: "Rotanı seç",
    description: "İlgine göre temel ya da derinleşen bir DevOps başlığından başla.",
  },
  {
    step: "03",
    title: "Bölüm bölüm ilerle",
    description: "Derslerini tamamla, quiz ile pekiştir ve ilerleme ritmini kaybetme.",
  },
] as const;

const topicChips = ["Linux", "Docker", "Git", "Terraform", "Kubernetes", "CI/CD"] as const;

function getHeroEyebrow(courses: Course[]) {
  return courses.length > 0
    ? `${courses.length}+ eğitim başlığı`
    : "Topluluk destekli DevOps öğrenme platformu";
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage({ courses }: { courses: Course[] }) {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <LandingHeader />

        {/* ── Hero ── */}
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl space-y-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              {getHeroEyebrow(courses)}
            </p>

            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              DevOps öğrenmeye <span className="text-muted-foreground">dağınık değil,</span>
              <br />
              doğru bir yerden başla.
            </h1>

            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              LearnOps; teknik konuları parçalı kaynaklar yerine tek bir akışta sunar. Daha az
              kaybolur, daha net ilerlersin.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                <Link href={routes.login}>
                  Öğrenmeye Başla
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-7 text-base"
              >
                <Link href="#neden">Neden LearnOps</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {topicChips.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Neden LearnOps ── */}
        <section id="neden" className="scroll-mt-24 border-t border-border py-20">
          <div className="mb-12">
            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Neden LearnOps
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
              Öğrenme sürecini daha sakin, daha net ve daha tutarlı hale getirir.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Kimler için ── */}
        <section id="kimler-icin" className="scroll-mt-24 border-t border-border py-20">
          <div className="mb-12">
            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Kimler için
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
              Yeni başlayanlardan kendini toparlamak isteyenlere kadar.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audienceCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Kurslar ── sadece feed.state === "ready" ise göster */}
        {courses && courses.length > 0 && (
          <section id="kurslar" className="scroll-mt-24 border-t border-border py-20">
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Kurslar
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
                  Öne çıkan başlıklar
                </h2>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
                <Link href={routes.login}>
                  Tümünü gör
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* ── Nasıl çalışır ── */}
        <section id="nasil-calisir" className="scroll-mt-24 border-t border-border py-20">
          <div className="mb-12">
            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Nasıl çalışır
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
              Giriş yap, rotanı seç, düzenli bir akışta ilerle.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {journeySteps.map((item, i) => (
              <article
                key={item.step}
                className="relative rounded-xl border border-border bg-card p-6"
              >
                <p className="text-5xl font-semibold tracking-tight text-border">{item.step}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-card-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                {i < journeySteps.length - 1 && (
                  <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 lg:block">
                    <ArrowRight className="size-4 text-border" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                DevOps öğrenmeye bu sefer düzgün bir yerden başla.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Hesabını aç, öğrenme ritmini kur ve teknik ilerlemeyi daha derli toplu hale getir.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                <Link href={routes.login}>
                  Giriş Yap
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-green-500" />
                Tek amaç: düzgün bir öğrenme akışı
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
