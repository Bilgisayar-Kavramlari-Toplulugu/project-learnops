import { BookMarked, CircleCheckBig, GitBranch, PlayCircle, Users, Zap } from "lucide-react";

const items = [
  {
    title: "Bölüm bölüm ilerle",
    desc: "Her kurs küçük, sindirilebilir bölümlere ayrılmış. Kaybolmazsın.",
    icon: BookMarked,
    color: "text-blue-500",
    span: "sm:col-span-2 sm:row-span-2",
    accent: "from-blue-500/25 to-transparent",
    big: true,
  },
  {
    title: "Quiz ile pekiştir",
    desc: "Her bölüm sonunda mini quiz. Öğrendiğini test et.",
    icon: CircleCheckBig,
    color: "text-emerald-500",
    span: "",
    accent: "from-emerald-500/20 to-transparent",
  },
  {
    title: "Kaldığın yerden devam",
    desc: "Hangi derste kaldığın hep hatırlanır.",
    icon: PlayCircle,
    color: "text-amber-500",
    span: "",
    accent: "from-amber-500/20 to-transparent",
  },
  {
    title: "Markdown'dan beslenen içerik",
    desc: "Tüm içerikler MDX. PR aç, içeriğe katkı ver.",
    icon: GitBranch,
    color: "text-fuchsia-500",
    span: "sm:col-span-2",
    accent: "from-fuchsia-500/20 to-transparent",
  },
  {
    title: "Topluluk ürünü",
    desc: "13+ kişilik bir ekibin gönüllü emeği.",
    icon: Users,
    color: "text-rose-500",
    span: "",
    accent: "from-rose-500/20 to-transparent",
  },
  {
    title: "Hızlı ve sade",
    desc: "Reklam yok, popup yok, dikkat dağıtan şey yok.",
    icon: Zap,
    color: "text-cyan-500",
    span: "",
    accent: "from-cyan-500/20 to-transparent",
  },
] as const;

export function BentoGrid() {
  return (
    <section id="neden" className="scroll-mt-20 pb-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Neden LearnOps
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Dağılmadan, sıkılmadan, kendi hızında öğren.
        </h2>
      </div>

      <div className="grid auto-rows-[140px] grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg ${item.span}`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br ${item.accent} opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                aria-hidden
              />

              <div className="relative flex h-full flex-col">
                <Icon className={`${"big" in item ? "size-7" : "size-5"} ${item.color}`} />
                <h3 className={`mt-3 font-semibold ${"big" in item ? "text-lg" : "text-sm"}`}>
                  {item.title}
                </h3>
                <p
                  className={`mt-1 leading-relaxed text-muted-foreground ${"big" in item ? "text-sm" : "text-xs"}`}
                >
                  {item.desc}
                </p>

                {/* Büyük kutuda bonus visual */}
                {"big" in item && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {["1. Linux Temelleri", "2. Bash", "3. Servisler", "+12 daha"].map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
