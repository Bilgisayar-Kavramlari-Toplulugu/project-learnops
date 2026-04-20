"use client";

import { useState, useMemo } from "react";
import CourseItem from "@/components/features/courses/course-item";
import { Course } from "@/types";
import { Search, SlidersHorizontal, BookOpen, XCircle } from "lucide-react";

interface CoursesClientProps {
  courses: Course[];
  title?: string;
  subtitle?: string;
}

export default function CoursesClient({ 
  courses, 
  title = "Tüm Kurslar", 
  subtitle = "Yeni beceriler keşfetmek için eğitimlerimize göz atın." 
}: CoursesClientProps) {
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
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className="space-y-10 w-full animate-in fade-in duration-500">
      {/* Header & Search Area */}
      <div className="flex flex-col xl:flex-row gap-6 items-end justify-between w-full bg-white dark:bg-zinc-900/20 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 w-full space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
              <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Kurs ara ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
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

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="">Tüm Kategoriler</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full sm:w-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="">Tüm Seviyeler</option>
              {allDifficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {filteredCourses.map((course) => (
            <CourseItem key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-md animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Search className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Kurs bulunamadı
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8 text-lg">
            Arama kriterlerinize uygun kurs bulamadık. Arama sorgunuzu veya filtreleri değiştirmeyi
            deneyin.
          </p>
          <button
            onClick={clearFilters}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
}
