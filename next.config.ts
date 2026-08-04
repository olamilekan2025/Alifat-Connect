// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
//   typescript: {
//     // Workaround for Next 16.2 type-validator generation bug producing:
//     // "Cannot find name 'pPageConfig'" in .next/dev/types/validator.ts
//     ignoreBuildErrors: true,
//   },
// };


// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "thumbs.dreamstime.com",
      },
    ],
  },
  // Exclude Socket.IO from Next.js routing
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;