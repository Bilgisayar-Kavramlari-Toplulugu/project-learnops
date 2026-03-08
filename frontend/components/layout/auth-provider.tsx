"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setOnAuthFailure } from "@/lib/api";

type AuthProviderProps = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = setOnAuthFailure(() => {
      router.replace("/login");
      router.refresh();
    });

    return unsubscribe;
  }, [router]);

  return <>{children}</>;
}
