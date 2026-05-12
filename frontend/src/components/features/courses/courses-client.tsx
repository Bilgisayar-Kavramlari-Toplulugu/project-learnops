"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import CourseItem from "@/components/features/courses/course-item";
import { Course } from "@/types";
import { Check, ChevronDown, Search, SlidersHorizontal, XCircle } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@/components/ui";

interface CoursesClientProps {
  courses: Course[];
  /** Server-rendered header slot (h1 + subtitle) for LCP optimisation */
  headerSlot: ReactNode;
}

export default function CoursesClient({ courses, headerSlot }: CoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  const allCategories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).filter(Boolean),
    [courses],
  );
  const allDifficulties = useMemo(
    () => Array.from(new Set(courses.map((c) => c.difficulty))).filter(Boolean),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // FR-07: liste response'unda description yok (intentional) — title üzerinden arama yapılır.
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || course.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [courses, searchQuery, selectedCategory, selectedDifficulty]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDifficulty("");
  };
  const selectedCategoryLabel = selectedCategory || "Tüm Kategoriler";
  const selectedDifficultyLabel = selectedDifficulty || "Tüm Seviyeler";

  return (
    <div className="space-y-10 w-full motion-safe:animate-[fadeIn_0.5s_ease-out_both]">
      {/* Header & Search Area */}
      <div className="flex flex-col xl:flex-row gap-6 items-end justify-between w-full bg-white dark:bg-zinc-900/20 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 w-full space-y-6">
          <div className="flex items-center gap-4">{headerSlot}</div>

          <div className="relative w-full max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              type="text"
              aria-label="Kurs ara"
              placeholder="Kurs ara ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-auto rounded-2xl border-zinc-200 bg-zinc-50 py-3.5 pr-4 pl-12 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Arama metnini temizle"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center pl-3 gap-2 text-zinc-500 dark:text-zinc-400 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Filtreler</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Kategori filtresi"
                  className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/90 px-3 text-left text-sm font-semibold text-zinc-700 shadow-sm outline-none transition-all hover:border-indigo-200 hover:bg-white focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-500/10 sm:w-44 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-indigo-500/40 dark:hover:bg-zinc-800"
                >
                  <span className="truncate">{selectedCategoryLabel}</span>
                  <ChevronDown className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl border-zinc-200 bg-white/95 p-1.5 shadow-xl shadow-zinc-950/10 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
              >
                {["", ...allCategories].map((category) => (
                  <DropdownMenuItem
                    key={category || "all-categories"}
                    onSelect={() => setSelectedCategory(category ?? "")}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 outline-none transition-colors focus:bg-indigo-50 focus:text-indigo-700 dark:text-zinc-200 dark:focus:bg-indigo-500/15 dark:focus:text-indigo-200"
                  >
                    <span>{category || "Tüm Kategoriler"}</span>
                    {selectedCategory === (category ?? "") && (
                      <Check className="size-4 text-indigo-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Zorluk seviyesi filtresi"
                  className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/90 px-3 text-left text-sm font-semibold text-zinc-700 shadow-sm outline-none transition-all hover:border-indigo-200 hover:bg-white focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-500/10 sm:w-40 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-indigo-500/40 dark:hover:bg-zinc-800"
                >
                  <span className="truncate">{selectedDifficultyLabel}</span>
                  <ChevronDown className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl border-zinc-200 bg-white/95 p-1.5 shadow-xl shadow-zinc-950/10 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
              >
                {["", ...allDifficulties].map((difficulty) => (
                  <DropdownMenuItem
                    key={difficulty || "all-difficulties"}
                    onSelect={() => setSelectedDifficulty(difficulty ?? "")}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 outline-none transition-colors focus:bg-indigo-50 focus:text-indigo-700 dark:text-zinc-200 dark:focus:bg-indigo-500/15 dark:focus:text-indigo-200"
                  >
                    <span>{difficulty || "Tüm Seviyeler"}</span>
                    {selectedDifficulty === (difficulty ?? "") && (
                      <Check className="size-4 text-indigo-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {filteredCourses.map((course) => (
            <CourseItem key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-md animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Search className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Kurs bulunamadı
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8 text-lg">
            Arama kriterlerinize uygun kurs bulamadık. Arama sorgunuzu veya filtreleri değiştirmeyi
            deneyin.
          </p>
          <Button
            onClick={clearFilters}
            size="lg"
            className="gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-95"
          >
            <XCircle className="w-5 h-5" />
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
}
