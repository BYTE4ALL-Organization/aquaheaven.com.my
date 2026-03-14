import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const generatedAt = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: generatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: generatedAt, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about-us`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy-policy`, lastModified: generatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms-of-service`, lastModified: generatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact-us`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/track-my-order`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/customer-support`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.5 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
        productCategories: {
          take: 1,
          select: { category: { select: { slug: true } } },
        },
      },
    });
    productPages = products.map((product) => {
      const categorySlug =
        product.productCategories?.[0]?.category?.slug?.trim() || "shop";
      return {
      url: `${base}/shop/${categorySlug}/${product.slug}`,
      lastModified: product.updatedAt ?? product.createdAt ?? generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      };
    });
  } catch (e) {
    console.warn("Sitemap: could not fetch product paths", e);
  }

  return [...staticPages, ...productPages];
}
