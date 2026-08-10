import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean production image for the Dockerfile (FR-008) — bundles only the
  // traced dependencies instead of the full node_modules tree.
  output: "standalone",
};

export default nextConfig;
