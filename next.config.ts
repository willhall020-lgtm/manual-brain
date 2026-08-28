import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical's Temporal polyfill breaks when Turbopack bundles/transforms
  // it for the server graph ("e.BigInt is not a function") — leave it as a
  // plain Node `require` instead of trying to compile it.
  serverExternalPackages: ["node-ical"],
};

export default nextConfig;
