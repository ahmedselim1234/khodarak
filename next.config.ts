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
    // AVIF first, WebP as the fallback — product photography is the single
    // heaviest thing on the catalog and home pages.
    formats: ["image/avif", "image/webp"],
    // Product images are content-addressed by the storage path and replaced
    // (never edited in place), so a long optimizer TTL is safe.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Both ship large barrel files; without this every page that imports one
    // icon pulls the whole index into its client chunk.
    optimizePackageImports: ["lucide-react", "@reduxjs/toolkit"],
  },
};

export default nextConfig;
