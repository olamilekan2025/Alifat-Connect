import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Workaround for Next 16.2 type-validator generation bug producing:
    // "Cannot find name 'pPageConfig'" in .next/dev/types/validator.ts
    ignoreBuildErrors: true,
  },
};


export default nextConfig;
