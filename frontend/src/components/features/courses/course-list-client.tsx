"use client";

import { useState, useMemo } from "react";
import { Search, Filter, BookOpen } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course, CourseDifficulty } from "@/types";
import { CourseListCard } from "./course-list-card";

interface CourseListClientProps {
  initialCourses: Course[];
}
export function CourseListClient({ initialCourses }: CourseListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hepsi");

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 max-w-xl space-y-4">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Kurs Ara
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="React, Python, Tasarım..."
              className="pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {initialCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialCourses.map((course) => (
            <CourseListCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-900">
            <BookOpen className="size-10 text-slate-300 dark:text-slate-800" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Kurs bulunamadı
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Arama kriterlerinize uygun bir kurs bulamadık. Lütfen farklı anahtar kelimeler deneyin.
          </p>
          <Button
            variant="link"
            className="mt-4 text-blue-600 dark:text-blue-400"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Hepsi");
            }}
          >
            Tüm filtreleri temizle
          </Button>
        </div>
      )}
    </div>
  );
}

// Utility for merging classes (assuming it exists in lib/utils)
import { cn } from "@/lib/utils";
