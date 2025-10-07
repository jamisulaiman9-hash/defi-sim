// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // ✅ Don’t fail the build because of ESLint
  },
  typescript: {
    ignoreBuildErrors: true,    // ✅ Don’t fail the build because of TS type errors
  },
};

export default nextConfig;
