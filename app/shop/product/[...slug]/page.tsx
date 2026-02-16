import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { Product } from "@/types/product.types";
import { notFound } from "next/navigation";

/** Map API product (name, slug, thumbnail, reviews) to Product type (title, srcUrl, rating, discount). */
function mapApiProductToCard(apiProduct: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: unknown;
  thumbnail?: string | null;
  images?: string[];
  reviews?: { rating: number }[];
}): Product {
  const price = Number(apiProduct.price) || 0;
  const reviews = Array.isArray(apiProduct.reviews) ? apiProduct.reviews : [];
  const rating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + (r?.rating ?? 0), 0) / reviews.length
      : 0;
  return {
    id: apiProduct.id as unknown as number,
    title: apiProduct.name,
    srcUrl:
      apiProduct.thumbnail ||
      (Array.isArray(apiProduct.images) && apiProduct.images[0]) ||
      "/images/placeholder.png",
    gallery: Array.isArray(apiProduct.images) ? apiProduct.images : [],
    price,
    discount: { amount: 0, percentage: 0 },
    rating,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const idOrSlug = slug?.[0];
  if (!idOrSlug) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/shop/products/${encodeURIComponent(idOrSlug)}`, {
    cache: "no-store",
  });

  if (!res.ok) notFound();
  const json = await res.json();
  if (!json.success || !json.product) notFound();

  const productData = mapApiProductToCard(json.product);
  const apiProduct = json.product as {
    id: string;
    description?: string | null;
    color?: string | null;
    availableColors?: string[];
    availableSizes?: string[];
    categories?: Array<{ id: string; name: string; slug: string }>;
    reviews?: Array<{
      id: string;
      rating: number;
      title?: string | null;
      comment?: string | null;
      createdAt: string;
      user?: { name: string | null } | null;
    }>;
  };
  const categorySlugs = (apiProduct.categories ?? []).map((c) => c.slug).filter(Boolean);
  const reviews = (Array.isArray(apiProduct.reviews) ? apiProduct.reviews : []).map((r, idx) => ({
    id: r.id || `r-${idx}`,
    user: r.user?.name?.trim() || "Guest",
    content: (r.comment || r.title || "").trim() || "No comment.",
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  }));

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header
            data={{
              ...productData,
              color: apiProduct.color ?? undefined,
              availableColors: Array.isArray(apiProduct.availableColors) ? apiProduct.availableColors : undefined,
              availableSizes: Array.isArray(apiProduct.availableSizes) ? apiProduct.availableSizes : undefined,
              description: apiProduct.description ?? undefined,
            }}
          />
        </section>
        <Tabs productId={apiProduct.id} reviews={reviews} categorySlugs={categorySlugs} />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <RelatedSection productId={productData.id} />
      </div>
    </main>
  );
}

async function RelatedSection({ productId }: { productId: number | string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = new URL(`${baseUrl}/api/shop/products`);
  url.searchParams.set("limit", "4");
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = res.ok ? await res.json() : null;
  const products = (data?.success && data?.products) ? data.products : [];
  const related = products
    .filter((p: { id: string }) => p.id !== String(productId))
    .slice(0, 4)
    .map(mapApiProductToCard);

  if (related.length === 0) return null;
  return (
    <ProductListSec title="You might also like" data={related} />
  );
}
