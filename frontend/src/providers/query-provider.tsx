"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useState } from "react";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
        { ssr: false },
      )
    : null;

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
