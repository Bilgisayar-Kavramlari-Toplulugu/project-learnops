import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Flag,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/lib/routes";

const foundationMetrics = [
  { label: "Core Routes", value: "3", hint: "dashboard, courses, exams" },
  { label: "UI Modules", value: "20+", hint: "reusable components" },
  { label: "Data Mode", value: "Live/Fallback", hint: "API resilient" },
] as const;

const platformPillars = [
  {
    title: "Structured Learning",
    description: "Course progression and exam preparation live in a single operator dashboard.",
    icon: BookOpenCheck,
  },
  {
    title: "Delivery Transparency",
    description: "Release-focused sections make sprint goals and blockers visible to the team.",
    icon: Flag,
  },
  {
    title: "Production Baseline",
    description: "API proxy and fallback strategy keep the UI stable during backend iterations.",
    icon: ShieldCheck,
  },
] as const;

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-6 py-14 lg:px-10">
      <div className="w-full space-y-7">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-5 rounded-3xl border border-blue-100/90 bg-white/85 p-6 shadow-lg shadow-blue-100/45 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 uppercase shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-sky-300">
              <Workflow className="size-3.5" />
              LearnOps Platform
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
              Gercek proje standardinda bir DevOps ogrenme merkezi kur.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Auth katmani devreden ciksa bile dashboard akisimiz saglam kaldı. Bu temel ustunden
              kurs, sinav ve operasyon ekranlarini sprint bazli buyutebiliriz.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild className="h-10 rounded-xl px-5 text-sm font-medium">
                <Link href={routes.dashboard}>
                  Dashboard&apos;a Git
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-xl border-blue-200 bg-white/85 px-5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
              >
                <Link href={routes.courses}>Kurslari Gor</Link>
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {foundationMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-blue-100/90 bg-white/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {metric.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-blue-100/90 bg-white/85 shadow-lg shadow-blue-100/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
            <CardHeader className="space-y-2 pb-2">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                MVP Track
              </Badge>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
                <Layers3 className="size-4 text-blue-600 dark:text-sky-400" />
                Frontend Foundation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="rounded-xl border border-blue-100/80 bg-blue-50/65 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                Route yapisi: `dashboard`, `landing`, `courses`, `exams`.
              </p>
              <p className="rounded-xl border border-blue-100/80 bg-blue-50/65 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                API rewrite: `/api/*` korunuyor, backend ile eslesmeye hazir.
              </p>
              <p className="rounded-xl border border-blue-100/80 bg-blue-50/65 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                UI stratejisi: fallback destekli gercek dashboard deneyimi.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {platformPillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <Card
                key={pillar.title}
                className="border-blue-100/90 bg-white/80 shadow-md shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-black/20"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
                    <Icon className="size-4 text-blue-600 dark:text-sky-400" />
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {pillar.description}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="rounded-3xl border border-blue-100/85 bg-white/82 p-5 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/72 dark:shadow-black/20">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-blue-700 uppercase dark:text-sky-300">
            <Sparkles className="size-3.5" />
            Next Step
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Sonraki sprintte kurs detay, sinav sonuc ve bildirim katmanlarini bu temel uzerine
            ekleyerek paneli production-ready hale getirebiliriz.
          </p>
        </section>
      </div>
    </main>
  );
}
