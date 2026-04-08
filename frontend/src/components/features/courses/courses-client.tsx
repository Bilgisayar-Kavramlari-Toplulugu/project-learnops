"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CourseItem from "@/components/features/courses/course-item";
import { Course } from "@/types";

export default function CoursesClient({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  const allCategories = [...new Set(courses.map((c) => c.category))];

  const allDifficulties = [...new Set(courses.map((c) => c.difficulty))];

  const filteredCourses = courses.filter((course) => {
    return (
      (!category || course.category === category) &&
      (!difficulty || course.difficulty === difficulty)
    );
  });

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);

    router.push(`/courses?${params.toString()}`);
  };

  return (
    <>
      <select onChange={(e) => handleFilterChange("category", e.target.value)}>
        <option value="">All Categories</option>
        {allCategories.map((c, i) => (
          <option key={i} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select onChange={(e) => handleFilterChange("difficulty", e.target.value)}>
        <option value="">All Levels</option>
        {allDifficulties.map((d, i) => (
          <option key={i} value={d}>
            {d}
          </option>
        ))}
      </select>

      {filteredCourses.length ? (
        filteredCourses.map((course) => <CourseItem key={course.id} course={course} />)
      ) : (
        <p>
          bu filtrelere uygun kurs yok, onun yerine sizi hajılang eğitimimizie yönlendirelim haji
        </p>
      )}
    </>
  );
}
