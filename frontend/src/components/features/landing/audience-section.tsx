import { GraduationCap, Laptop, UsersRound } from "lucide-react";

const audiences = [
  {
    title: "DevOps'a yeni başlayanlar",
    desc: "Linux, Docker ve CI/CD gibi temel konuları adım adım öğrenmek isteyenler.",
    icon: GraduationCap,
    color: "text-emerald-500",
  },
  {
    title: "Geliştiriciler",
    desc: "Ürettiği uygulamayı deploy, izleme ve operasyon tarafıyla birlikte düşünmek isteyenler.",
    icon: Laptop,
    color: "text-cyan-500",
  },
  {
    title: "Toplulukla öğrenenler",
    desc: "Açık kaynak içeriklere katkı vererek, pratik yaparak ilerlemek isteyen ekipler.",
    icon: UsersRound,
    color: "text-fuchsia-500",
  },
] as const;

export function AudienceSection() {
  return (
    <section id="kimler-icin" className="scroll-mt-20 pb-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Kimler için
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Pratik DevOps öğrenmek isteyen herkes için.
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {audiences.map((audience) => {
          const Icon = audience.icon;

          return (
            <div
              key={audience.title}
              className="rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <Icon className={`size-6 ${audience.color}`} />
              <h3 className="mt-4 text-sm font-semibold">{audience.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{audience.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
