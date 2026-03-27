import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@remotion/renderer",
    "@remotion/bundler",
    "esbuild",
    "@esbuild/linux-x64",
  ],
};

export default nextConfig;
