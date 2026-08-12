import type { MetadataRoute } from "next";
import { createCatalogClient } from "@/lib/supabase/publicCatalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khodarak.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/browse?category=fruits`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/subscription`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/pricing-preview`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/signup`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const supabase = createCatalogClient(3600);
  const { data } = await supabase
    .from("products")
    .select("id, updated_at")
    .order("sort_order", { ascending: true });

  const productRoutes: MetadataRoute.Sitemap = (data ?? []).map((product) => ({
    url: `${siteUrl}/browse/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
