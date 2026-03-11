"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const VALID_PROVIDERS = ["google", "linkedin", "github"];

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    const provider = searchParams.get("provider");
    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      router.push("/login?error=invalid_provider");
      return;
    }

    router.push("/dashboard");
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="mb-4 text-lg font-medium">Oturumunuz açılıyor...</h1>
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="mb-4 text-lg font-medium">Oturumunuz açılıyor...</h1>
          <div className="w-full max-w-sm space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}