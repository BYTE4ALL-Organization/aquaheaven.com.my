import { prisma } from "@/lib/prisma";
import { getProductDetail } from "@/lib/shop-data";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

/** Legacy /shop/product/{id-or-slug} – redirect to canonical /shop/{categorySlug}/{productSlug}. */
export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const idOrSlug = slug?.[0];
  if (!idOrSlug) notFound();

  const productRow = await getProductDetail(prisma, idOrSlug);
  if (!productRow) notFound();

  const categorySlugs = (productRow.productCategories ?? [])
    .map((pc) => pc.category?.slug)
    .filter(Boolean) as string[];
  const canonicalCategorySlug = categorySlugs[0] ?? "shop";
  redirect(`/shop/${canonicalCategorySlug}/${productRow.slug}`);
}
