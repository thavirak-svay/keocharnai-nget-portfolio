import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-7eba62e4264b4804be4b689b906673cd.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.tiktok.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
