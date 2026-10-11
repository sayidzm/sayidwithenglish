import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate the local Auth API contract tests from the real preview build.
  distDir: process.env.NEXT_E2E_DIST_DIR || ".next",
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // CSS Modules must retain Next.js' native module processing.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
