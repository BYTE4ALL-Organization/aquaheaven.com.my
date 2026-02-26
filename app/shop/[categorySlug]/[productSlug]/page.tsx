import ProductPageContent from "@/app/shop/product/ProductPageContent";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasUserPurchasedProduct } from "@/lib/purchase-check";
import { getAllProductPaths, getProductDetail } from "@/lib/shop-data";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Pre-render all product pages at build: /shop/{categorySlug}/{productSlug}. */
export async function generateStaticParams() {
  const paths = await getAllProductPaths(prisma);
  return paths.map((p) => ({
    categorySlug: p.categorySlug,
    productSlug: p.slug,
  }));
}

export default async function CategoryProductPage({
  params,
}: {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}) {
  const { categorySlug, productSlug } = await params;
  if (!productSlug) notFound();

  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const request = new Request("http://localhost", {
    headers: { cookie },
  });

  const [productRow, session] = await Promise.all([
    getProductDetail(prisma, productSlug),
    auth(request),
  ]);

  if (!productRow) notFound();

  const productCategorySlugs = (productRow.productCategories ?? [])
    .map((pc) => pc.category?.slug)
    .filter(Boolean) as string[];
  const canonicalCategorySlug = productCategorySlugs[0] ?? "shop";
  if (canonicalCategorySlug !== categorySlug) {
    redirect(`/shop/${canonicalCategorySlug}/${productRow.slug}`);
  }

  let canReview = false;
  if (session?.user) {
    canReview = await hasUserPurchasedProduct(session.user.id, productRow.id);
  }

  return (
    <ProductPageContent productRow={productRow} canReview={canReview} />
  );
}
