"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setOnAuthFailure } from "@/lib/api";
import { routes } from "@/lib/routes";

type AuthProviderProps = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = setOnAuthFailure(() => {
      router.replace(routes.login);
      router.refresh();
    });

    return unsubscribe;
  }, [router]);

  return <>{children}</>;
}
