import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: removed `output: "export"` because API routes (e.g. NextAuth)
  // are incompatible with static `output: export`. Keeping default server
  // output so dynamic API routes work during `next build`.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
