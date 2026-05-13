import WrapperContainer from "@/components/features/dashboard/wrapper-container";
import QuizClient from "@/components/features/courses/quiz-client";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <WrapperContainer>
      <QuizClient slug={slug} />
    </WrapperContainer>
  );
}
