import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function DashboardErrorState({
  message = "Profil yüklenirken bir hata oluştu.",
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{message}</p>
        {onRetry && (
          <Button variant="default" size="sm" onClick={onRetry}>
            Tekrar Dene
          </Button>
        )}
      </div>
    </div>
  );
}
