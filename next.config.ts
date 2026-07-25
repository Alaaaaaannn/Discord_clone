import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/*" },
      { protocol: "https", hostname: "utfs.io", pathname: "/f/*" },
    ],
  },
  experimental: {
    // Persists Turbopack's compiled output to disk between `next dev` restarts.
    // Without this, every restart cold-compiles routes on first hit, and a
    // Clerk middleware rewrite landing mid-compile can 404 the sign-up/sign-in
    // pages before Turbopack finishes linking them.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
