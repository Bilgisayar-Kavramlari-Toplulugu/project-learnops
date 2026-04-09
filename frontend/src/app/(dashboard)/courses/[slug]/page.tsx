import CourseItem from "@/components/features/courses/course-item";
import course_list from "@/data/fake-courses";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = course_list.find((c) => c.slug == slug);

  /* const fetchCourse = () => {
    return fetch(`https://api.example.com/courses/${slug}`, {
      cache: "force-cache",
    }).then((res) => res.json());
  }; */

  // const course = await fetchCourse();

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div>
      <CourseItem course={course} />
      {/* {sections.map((s) => (
        <SectionItem key={s.id} section={s} />
      ))} */}
    </div>
  );
}
