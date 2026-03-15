"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardUser } from "@/types";

export function useUser(): { user: DashboardUser | null; loading: boolean } {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{
        id: string;
        email: string;
        display_name: string;
        avatar_type: string;
        role: string;
      }>("/auth/me")
      .then((res) => {
        const data = res.data;
        setUser({
          name: data.display_name,
          email: data.email,
          role: data.role,
        });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
