import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
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
import { routes } from "@/lib/routes";

// ── Nav ────────────────────────────────────────────────────────────────────

const navItems = [
  { href: "#neden", label: "Neden LearnOps" },
  { href: "#kimler-icin", label: "Kimler için" },
  { href: "#nasil-calisir", label: "Nasıl çalışır" },
] as const;

function LandingHeader() {
  return (
    <header className="sticky top-3 z-30">
      <div className="flex items-center justify-between rounded-full border border-border/50 bg-background/80 px-5 py-2 shadow-sm backdrop-blur-md">
        <Link href={routes.root} className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-3.5" />
          </div>
          <span className="text-sm font-bold tracking-wide">LearnOps</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-full text-xs">
            <Link href={routes.login}>
              <LogIn className="size-3" />
              Giriş
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden h-8 rounded-full text-xs sm:flex">
            <Link href={routes.login}>Başla</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────

const pillars = [
  {
    title: "Türkçe ve net anlatım",
    desc: "Parçalı blog zincirleri yerine baştan sona temiz bir öğrenme akışı.",
    icon: GraduationCap,
    color: "text-blue-500",
  },
  {
    title: "DevOps odaklı başlıklar",
    desc: "Linux, Docker, Git, Terraform — aynı platform diliyle ilerler.",
    icon: Compass,
    color: "text-emerald-500",
  },
  {
    title: "Takip edilebilir ilerleme",
    desc: "Bölüm, quiz ve ilerleme çubuğu ile nerede olduğun hep görünür.",
    icon: Gauge,
    color: "text-amber-500",
  },
] as const;

const audienceCards = [
  {
    title: "Sıfırdan başlayanlar",
    desc: "Nereden başlayacağını bilmiyorsan düzgün bir ilk rota verir.",
    icon: Target,
  },
  {
    title: "Kendini toparlamak isteyenler",
    desc: "Dağılmış notları tek bir düzende toplar.",
    icon: Layers3,
  },
  {
    title: "Takım içi öğrenme",
    desc: "Ortak referans dili olan bir öğrenme zemini sunar.",
    icon: Users,
  },
] as const;

const steps = [
  { n: "1", title: "Giriş yap", desc: "Google, GitHub veya LinkedIn ile hemen geç." },
  { n: "2", title: "Rotanı seç", desc: "İlgine göre bir DevOps başlığından başla." },
  { n: "3", title: "İlerle", desc: "Derslerini tamamla, quiz ile pekiştir." },
] as const;

const chips = ["Linux", "Docker", "Git", "Terraform", "Kubernetes", "CI/CD"] as const;

// ── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-4">
        <LandingHeader />

        {/* ── Hero ── */}
        <section className="pb-16 pt-20 sm:pt-24">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" />
            DevOps öğrenme platformu
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            DevOps öğrenmeye <span className="text-muted-foreground">dağınık değil,</span>
            <br />
            doğru bir yerden başla.
          </h1>

          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Teknik konuları parçalı kaynaklar yerine tek bir akışta sunar. Daha az kaybolur, daha
            net ilerlersin.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild size="default" className="h-10 rounded-full px-6">
              <Link href={routes.login}>
                Giriş Yap <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="default" className="h-10 rounded-full px-6">
              <Link href={routes.courses}>
                Kurslara Göz At <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ── Neden ── */}
        <section id="neden" className="scroll-mt-20 pb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Neden LearnOps
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight">
            Daha sakin, daha net, daha tutarlı bir öğrenme süreci.
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-xl border border-border/50 bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <Icon className={`size-5 ${p.color}`} />
                  <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Kimler için ── */}
        <section id="kimler-icin" className="scroll-mt-20 pb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Kimler için
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight">
            Yeni başlayanlardan kendini toparlamak isteyenlere.
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {audienceCards.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title}
                  className="group rounded-xl border border-border/50 bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  <h3 className="mt-3 text-sm font-semibold">{a.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Nasıl çalışır ── */}
        <section id="nasil-calisir" className="scroll-mt-20 pb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Nasıl çalışır
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight">Üç adımda başla.</h2>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative flex-1 rounded-xl border border-border/50 bg-card p-5 transition-shadow hover:shadow-md"
              >
                <span className="text-3xl font-bold text-muted/40">{s.n}</span>
                <h3 className="mt-2 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                    <ArrowRight className="size-3.5 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-12">
          <div className="flex flex-col items-start gap-6 rounded-xl border border-border/50 bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Bu sefer <span className="text-primary">düzgün bir yerden</span> başla.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hesabını aç, öğrenme ritmini kur.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button asChild size="default" className="h-10 rounded-full px-6">
                <Link href={routes.login}>
                  Giriş Yap <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <CheckCircle2 className="size-3.5 text-green-500" />
                Ücretsiz
              </span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between border-t border-border/40 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} LearnOps</span>
          <div className="flex gap-4">
            {navItems.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}