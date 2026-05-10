import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // for docker simplicity in this honeypot
  }
};

export default nextConfig;
