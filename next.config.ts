import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Node.js-only packages out of the client bundle
  serverExternalPackages: ["pg", "bcryptjs", "@prisma/client", "@prisma/adapter-pg"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },

  // Suppress React hydration warnings from browser extensions
  reactStrictMode: false,
};

export default nextConfig;
