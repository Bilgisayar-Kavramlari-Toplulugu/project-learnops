"use client";

import { Course } from "@/types";
import { Clock, Signal, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CourseItem({ course }: { course: Course }) {
  const difficultyColors: Record<string, string> = {
    Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Advanced: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  };
  const badgeColor =
    difficultyColors[course.difficulty] ||
    "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeColor} flex items-center gap-1.5`}
          >
            <Signal className="w-3 h-3" />
            {course.difficulty}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700/50">
            <Clock className="w-3 h-3" />
            {course.duration_minutes} min
          </span>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
          {course.title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-6 flex-1">
          {course.description}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          <Tag className="w-4 h-4" />
          {course.category}
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all transform group-hover:scale-110 group-hover:-rotate-45">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
