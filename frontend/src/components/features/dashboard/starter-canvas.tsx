interface StarterCanvasProps {
  title: string;
  description: string;
}

export function StarterCanvas({ title, description }: StarterCanvasProps) {
  return (
    <section className="mx-auto flex min-h-[62vh] w-full max-w-6xl items-center justify-center rounded-2xl border border-dashed border-blue-200/80 bg-white/65 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/55">
      <div className="max-w-xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </section>
  );
}
