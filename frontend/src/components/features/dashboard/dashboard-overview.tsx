import {
  BookOpenCheck,
  CalendarClock,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseCardItem, DashboardSuggestion, LearningPath, UpcomingExam } from "@/types";
import { ContinueLearningCard } from "./continue-learning-card";
import { EnrolledCoursesSection } from "./enrolled-courses-section";
import { DashboardRightRail } from "./right-rail";
import { UpcomingExamCard } from "./upcoming-exam-card";

interface DashboardOverviewProps {
  userName: string;
  learningPath: LearningPath;
  courses: CourseCardItem[];
  upcomingExam: UpcomingExam;
  suggestion: DashboardSuggestion;
}

export function DashboardOverview({
  userName,
  learningPath,
  courses,
  upcomingExam,
  suggestion,
}: DashboardOverviewProps) {
  const averageCourseProgress =
    courses.length > 0
      ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
      : 0;

  const summaryCards = [
    {
      label: "Active Courses",
      value: `${courses.length}`,
      hint: "currently enrolled",
      icon: BookOpenCheck,
    },
    {
      label: "Avg Progress",
      value: `${averageCourseProgress}%`,
      hint: "course completion",
      icon: TrendingUp,
    },
    {
      label: "Next Exam",
      value: upcomingExam.nextAttempt,
      hint: upcomingExam.title,
      icon: CalendarClock,
    },
  ] as const;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <header className="space-y-4 rounded-2xl border border-blue-100/80 bg-white/80 px-4 py-4 shadow-sm shadow-blue-100/40 backdrop-blur sm:px-5 dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-black/20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
                Dashboard
              </h1>
              <p className="mt-1 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                Welcome back, {userName}
              </p>
            </div>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-blue-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Sparkles className="size-4 text-blue-600 dark:text-sky-400" />
              Quick Filters
              <SlidersHorizontal className="size-4 text-slate-500 dark:text-slate-400" />
            </Button>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="group flex h-11 flex-1 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 shadow-xs transition focus-within:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-slate-500">
              <Search className="size-4 text-slate-400 transition group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-sky-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </label>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-xl border border-blue-100/90 bg-white/85 px-3.5 py-3 shadow-xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
                      <Icon className="size-3.5" />
                      {card.label}
                    </p>
                    <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        <ContinueLearningCard learningPath={learningPath} />
        <EnrolledCoursesSection courses={courses} />
        <UpcomingExamCard exam={upcomingExam} />
      </div>

      <DashboardRightRail suggestion={suggestion} />
    </section>
  );
}
