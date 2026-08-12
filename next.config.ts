import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"`. Vercel does its own output file tracing and
  // never writes `.next/next-server.js.nft.json`, but standalone output
  // unconditionally reads it — which failed the deploy with ENOENT. Vercel
  // does not need standalone. Restoring it would also require moving off the
  // Vercel deploy (see Dockerfile, which copies `.next/standalone`).
  images: {
    // Product photos live in Supabase Storage (product-images bucket) —
    // see specs/003-phase-2-catalog-admin-crud/research.md §3.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" }],
  },
};

export default nextConfig;
