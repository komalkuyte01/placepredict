import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Handle pdf-parse as server-only external package
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
