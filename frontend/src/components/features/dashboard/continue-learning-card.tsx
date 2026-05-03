import { ArrowRight } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { LearningPath } from "@/types";
import { ProgressRing } from "./progress-ring";

interface ContinueLearningCardProps {
  learningPath: LearningPath;
}

export function ContinueLearningCard({ learningPath }: ContinueLearningCardProps) {
  return (
    <Card className="border-blue-100/90 bg-white/85 shadow-lg shadow-blue-100/50 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/25">
      <CardHeader className="pb-2">
        <CardTitle className="text-[2rem] leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Continue Learning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-r from-[#dce9ff] via-[#e9f1ff] to-[#dce7ff] p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:from-[#2a3550] dark:via-[#29344d] dark:to-[#27324a]">
          <h3 className="text-2xl leading-tight font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            {learningPath.title}
          </h3>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <ProgressRing value={learningPath.progress} />
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion</p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Learning in progress
                </p>
              </div>
            </div>
            <Button className="h-11 rounded-2xl bg-blue-600 px-6 text-sm font-semibold shadow-sm hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-900 dark:hover:bg-sky-400">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            Next up: {learningPath.nextStep}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
