import type { NextConfig } from "next";

// Proxy to backend is handled at runtime by src/app/api/[...path]/route.ts
// so that BACKEND_INTERNAL_URL is read at request time, not baked into the image.
const nextConfig: NextConfig = {};

export default nextConfig;
