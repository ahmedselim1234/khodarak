import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khodarak.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing behind auth belongs in an index — these either redirect to
        // /login for a crawler or expose per-account URLs with no public value.
        disallow: ["/dashboard", "/admin", "/api", "/cart", "/subscription/confirmed"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
