import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server rendering enabled (disabled static export)
  // Previously used static `output: "export"` which prevents dynamic
  // `/moments/[id]` routes from being rendered at request time.
  trailingSlash: true,
  // basePath is set via env var so local dev works without it
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
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
