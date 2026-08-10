import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean production image for the Dockerfile (FR-008) — bundles only the
  // traced dependencies instead of the full node_modules tree.
  output: "standalone",
  images: {
    // Product photos live in Supabase Storage (product-images bucket) —
    // see specs/003-phase-2-catalog-admin-crud/research.md §3.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" }],
  },
};

export default nextConfig;
