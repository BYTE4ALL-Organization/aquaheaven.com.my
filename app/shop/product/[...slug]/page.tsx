import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasUserPurchasedProduct } from "@/lib/purchase-check";
import { getProductDetail, getProductsList } from "@/lib/shop-data";
import { Product } from "@/types/product.types";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

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
  quantity?: number;
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
    quantity: apiProduct.quantity,
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

  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const request = new Request("http://localhost", {
    headers: { cookie },
  });

  const [productRow, session] = await Promise.all([
    getProductDetail(prisma, idOrSlug),
    auth(request),
  ]);

  if (!productRow) notFound();

  let canReview = false;
  if (session?.user) {
    canReview = await hasUserPurchasedProduct(session.user.id, productRow.id);
  }

  const productData = mapApiProductToCard({
    id: productRow.id,
    name: productRow.name,
    slug: productRow.slug,
    description: productRow.description,
    price: productRow.price,
    thumbnail: productRow.thumbnail,
    images: productRow.images,
    reviews: productRow.reviews?.map((r) => ({ rating: r.rating })) ?? [],
    quantity: productRow.quantity,
  });
  const categorySlugs = (productRow.productCategories ?? []).map((pc) => pc.category.slug).filter(Boolean);
  const reviews = (productRow.reviews ?? []).map((r, idx) => ({
    id: r.id || `r-${idx}`,
    user: r.user?.name?.trim() || "Guest",
    content: (r.comment || r.title || "").trim() || "No comment.",
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  }));
  const apiProduct = {
    id: productRow.id,
    slug: productRow.slug,
    description: productRow.description,
    color: productRow.color,
    availableColors: productRow.availableColors,
    availableSizes: productRow.availableSizes,
    canReview,
    categories: (productRow.productCategories ?? []).map((pc) => pc.category),
    reviews: productRow.reviews,
    brand: productRow.brand?.name,
  };

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header
            data={{
              ...productData,
              slug: apiProduct.slug,
              color: apiProduct.color ?? undefined,
              availableColors: Array.isArray(apiProduct.availableColors) ? apiProduct.availableColors : undefined,
              availableSizes: Array.isArray(apiProduct.availableSizes) ? apiProduct.availableSizes : undefined,
              description: apiProduct.description ?? undefined,
              brand: apiProduct.brand ?? undefined,
            }}
          />
        </section>
        <Tabs
          productId={apiProduct.id}
          productSlug={apiProduct.slug}
          reviews={reviews}
          categorySlugs={categorySlugs}
          canReview={apiProduct.canReview === true}
        />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <RelatedSection productId={productData.id} />
      </div>
    </main>
  );
}

async function RelatedSection({ productId }: { productId: number | string }) {
  const { products } = await getProductsList(prisma, { limit: 8 });
  const related = products
    .filter((p) => p.id !== String(productId))
    .slice(0, 4)
    .map((p) =>
      mapApiProductToCard({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        thumbnail: p.thumbnail,
        images: p.images,
        reviews: p.reviews?.map((r) => ({ rating: r.rating })) ?? [],
      })
    );

  if (related.length === 0) return null;
  return (
    <ProductListSec title="You might also like" data={related} />
  );
}
