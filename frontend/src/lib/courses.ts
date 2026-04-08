import { Course } from "@/types";
import { API_BASE } from "./constants";

export async function getCourses(): Promise<Course[]> {
  const isServer = typeof window === "undefined";
  // On the server (SSG build), we must use an absolute URL.
  // Ortam değişkenini (BACKEND_INTERNAL_URL) arar, yoksa localhost'a düşer (fallback).
  // Docker ağında bu http://learnops_backend:8000 olabilir.
  const backendInternal = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
  const baseUrl = `${backendInternal}/v1`;

  try {
    const res = await fetch(`${baseUrl}/courses`, {
      cache: "force-cache",
      // Node fetch shouldn't get credentials, while browser needs it
      ...(isServer ? {} : { credentials: "include" }),
    });

    if (!res.ok) {
      console.warn(`[getCourses] Failed to fetch. Status: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("[getCourses] Fetch error (backend might be down during build):", error);
    return [];
  }
}
