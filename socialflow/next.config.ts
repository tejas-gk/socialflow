import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // reactStrictMode: true,

  // ✅ Skip ESLint during build
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fbcdn.net", // Allows all Facebook CDN subdomains
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com", // Allows all Instagram CDN subdomains
      },
    ],
  },
};

export default nextConfig;