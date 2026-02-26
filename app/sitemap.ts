import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";
import { getAllProductPaths } from "@/lib/shop-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/cart`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms-of-service`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/track-my-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/customer-support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const paths = await getAllProductPaths(prisma);
    productPages = paths.map((p) => ({
      url: `${base}/shop/${p.categorySlug}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.warn("Sitemap: could not fetch product paths", e);
  }

  return [...staticPages, ...productPages];
}
