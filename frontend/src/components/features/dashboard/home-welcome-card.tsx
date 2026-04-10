interface HomeWelcomeCardProps {
  userName: string;
}

export function HomeWelcomeCard({ userName }: HomeWelcomeCardProps) {
  return (
    <section className="w-full rounded-3xl border border-blue-100/80 bg-white/85 p-8 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-black/20">
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.12em] text-blue-600 uppercase dark:text-sky-400">
          LearnOps
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Hos geldin, {userName}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Bu ana sayfa starter olarak hazirlandi. Istedigin componentleri bu alanin altina adim adim
          ekleyebiliriz.
        </p>
      </div>
    </section>
  );
}
