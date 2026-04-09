"use client";

import { Course } from "@/types";
import { useRouter } from "next/navigation";

export default function CourseItem({ course }: { course: Course }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/courses/${course.slug}`);
  };

  return (
    <div className="course-item border-2" onClick={handleClick}>
      <p>id: {course.id}</p>
      <p>slug: {course.slug}</p>
      <p>title: {course.title}</p>
      <p>description: {course.description}</p>
      <p>category: {course.category}</p>
      <p>difficulty: {course.difficulty}</p>
      <p>duration_minutes: {course.duration_minutes}</p>
      <p>is_published: {course.is_published}</p>
      <p>created_at: {course.created_at}</p>
    </div>
  );
}
