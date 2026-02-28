export default function LoginLeftCard() {
  const features = [
    "Ucretsiz ve acik kaynak egitim",
    "Topluluk katilimli icerikler",
    "Interaktif quiz sistemi",
    "Docker ve DevOps odakli dersler",
  ];

  return (
    <section className="w-full max-w-xl rounded-3xl border border-cyan-900/40 bg-slate-900/40 p-8 text-slate-200 shadow-[0_0_0_1px_rgba(14,116,144,0.15),0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur">
      <h1 className="text-5xl font-extrabold tracking-tight text-white">
        LearnOps
      </h1>
      <div className="mt-2 h-1 w-24 rounded-full bg-cyan-500" />

      <p className="mt-6 text-2xl font-semibold text-slate-100">
        DevOps Ogrenme Platformu
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Turkiye&apos;nin acik kaynak DevOps platformu
      </p>

      <ul className="mt-10 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="rounded-xl border border-slate-800/80 bg-slate-900/70 px-5 py-4 text-base text-cyan-300"
          >
            ✓ {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
