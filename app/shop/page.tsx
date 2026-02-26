import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { prisma } from "@/lib/prisma";
import { getFilters, getProductsList } from "@/lib/shop-data";
import { Product } from "@/types/product.types";

function mapApiProductToCard(apiProduct: {
  id: string;
  name: string;
  slug: string;
  price: unknown;
  thumbnail?: string | null;
  images?: string[];
  reviews?: { rating: number }[];
  productCategories?: { category: { slug: string } }[];
}): Product & { name?: string; slug?: string; thumbnail?: string; images?: string[]; reviews?: { rating: number }[]; categorySlug?: string } {
  const reviews = Array.isArray(apiProduct.reviews) ? apiProduct.reviews : [];
  const rating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + (r?.rating ?? 0), 0) / reviews.length
      : 0;
  const categorySlug = apiProduct.productCategories?.[0]?.category?.slug?.trim() ?? "shop";
  return {
    id: apiProduct.id as unknown as number,
    title: apiProduct.name,
    name: apiProduct.name,
    slug: apiProduct.slug,
    categorySlug,
    srcUrl:
      apiProduct.thumbnail ||
      (Array.isArray(apiProduct.images) && apiProduct.images[0]) ||
      "/images/placeholder.png",
    thumbnail: apiProduct.thumbnail ?? undefined,
    images: Array.isArray(apiProduct.images) ? apiProduct.images : [],
    price: Number(apiProduct.price) || 0,
    discount: { amount: 0, percentage: 0 },
    rating,
    reviews,
  };
}

const PER_PAGE = 12;

const VIEW_BRANDS = "brands";

function buildShopQuery(params: Record<string, string | string[] | undefined>, page: number): string {
  const q = new URLSearchParams();
  const category = typeof params?.category === "string" ? params.category : undefined;
  const brand = typeof params?.brand === "string" ? params.brand : undefined;
  const color = typeof params?.color === "string" ? params.color : undefined;
  const size = typeof params?.size === "string" ? params.size : undefined;
  const minPrice = typeof params?.minPrice === "string" ? params.minPrice : undefined;
  const maxPrice = typeof params?.maxPrice === "string" ? params.maxPrice : undefined;
  const bestSellers = params?.bestSellers === "1" || params?.bestSellers === "true";
  const view = typeof params?.view === "string" ? params.view : undefined;
  if (category) q.set("category", category);
  if (brand) q.set("brand", brand);
  if (color) q.set("color", color);
  if (size) q.set("size", size);
  if (minPrice) q.set("minPrice", minPrice);
  if (maxPrice) q.set("maxPrice", maxPrice);
  if (bestSellers) q.set("bestSellers", "1");
  if (view === VIEW_BRANDS) q.set("view", VIEW_BRANDS);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = typeof params?.category === "string" ? params.category : undefined;
  const brand = typeof params?.brand === "string" ? params.brand : undefined;
  const color = typeof params?.color === "string" ? params.color : undefined;
  const size = typeof params?.size === "string" ? params.size : undefined;
  const minPrice = typeof params?.minPrice === "string" ? params.minPrice : undefined;
  const maxPrice = typeof params?.maxPrice === "string" ? params.maxPrice : undefined;
  const bestSellers = params?.bestSellers === "1" || params?.bestSellers === "true";
  const viewBrands = params?.view === VIEW_BRANDS;
  const page = Math.max(1, parseInt(typeof params?.page === "string" ? params.page : "", 10) || 1);
  const offset = (page - 1) * PER_PAGE;

  const minPriceNum = minPrice != null && minPrice !== "" ? parseFloat(minPrice) : undefined;
  const maxPriceNum = maxPrice != null && maxPrice !== "" ? parseFloat(maxPrice) : undefined;

  const brandsViewLimit = 500;

  const [filtersData, { products: productsRaw, total }] =
    await Promise.all([
      getFilters(prisma),
      getProductsList(prisma, viewBrands
        ? {
            color,
            size,
            minPrice: minPriceNum,
            maxPrice: maxPriceNum,
            limit: brandsViewLimit,
            offset: 0,
            sortBy: "createdAt",
            order: "desc",
          }
        : {
            category,
            brand,
            color,
            size,
            bestSellers: bestSellers || undefined,
            minPrice: minPriceNum,
            maxPrice: maxPriceNum,
            limit: PER_PAGE,
            offset,
            sortBy: "createdAt",
            order: "desc",
          }),
    ]);

  const options = {
    categories: filtersData.categories ?? [],
    brands: filtersData.brands ?? [],
    priceRange: filtersData.priceRange ?? { min: 0, max: 250 },
    colors: filtersData.colors ?? [],
    sizes: filtersData.sizes ?? [],
  };

  type ProductWithBrand = (typeof productsRaw)[number] & { brand?: { name: string; slug?: string } | null };
  const products: (Product & { name?: string; slug?: string; thumbnail?: string; images?: string[]; reviews?: { rating: number }[]; categorySlug?: string })[] =
    productsRaw.map((p) =>
      mapApiProductToCard({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        thumbnail: p.thumbnail,
        images: p.images,
        reviews: p.reviews?.map((r) => ({ rating: r.rating })) ?? [],
        productCategories: p.productCategories,
      })
    );

  const brandOrder: string[] = [];
  const byBrand = new Map<string, (Product & { name?: string; slug?: string; thumbnail?: string; images?: string[]; reviews?: { rating: number }[]; categorySlug?: string })[]>();
  if (viewBrands) {
    const rawWithBrand = productsRaw as ProductWithBrand[];
    for (let i = 0; i < rawWithBrand.length; i++) {
      const p = rawWithBrand[i];
      const brandName = p.brand?.name?.trim() ?? "Other";
      if (!byBrand.has(brandName)) brandOrder.push(brandName);
      const list = byBrand.get(brandName) ?? [];
      list.push(products[i]);
      byBrand.set(brandName, list);
    }
  }

  const totalPages = viewBrands ? 1 : Math.max(1, Math.ceil(total / PER_PAGE));
  const start = total === 0 ? 0 : viewBrands ? 1 : (page - 1) * PER_PAGE + 1;
  const end = viewBrands ? total : Math.min(page * PER_PAGE, total);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop
          categoryName={
            viewBrands
              ? undefined
              : category
                ? (() => {
                    const parent = options.categories.find((c) => c.slug === category);
                    if (parent) return parent.name;
                    for (const p of options.categories) {
                      const child = p.children?.find((ch) => ch.slug === category);
                      if (child) return child.name;
                    }
                    return undefined;
                  })()
                : undefined
          }
          bestSellers={bestSellers}
          viewBrands={viewBrands}
        />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters options={options} />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px] text-black">
                  {viewBrands ? "Brands" : "Shop"}
                </h1>
                <MobileFilters options={options} />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {total === 0 ? 0 : start}–{end} of {total} products
                </span>
                {!viewBrands && (
                  <div className="flex items-center">
                    Sort by:{" "}
                    <Select defaultValue="most-popular">
                      <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="most-popular">Most Popular</SelectItem>
                        <SelectItem value="low-price">Low Price</SelectItem>
                        <SelectItem value="high-price">High Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            {viewBrands ? (
              brandOrder.length > 0 ? (
                <div className="flex flex-col gap-10 md:gap-12">
                  {brandOrder.map((brandName) => {
                    const brandProducts = byBrand.get(brandName) ?? [];
                    return (
                      <section key={brandName}>
                        <h2 className="font-bold text-xl md:text-2xl text-black mb-4 md:mb-5">
                          {brandName}
                        </h2>
                        <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                          {brandProducts.map((product) => (
                            <ProductCard key={product.id} data={product} />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <p className="text-black/60 py-12 text-center">
                  No products yet. Add products from the admin.
                </p>
              )
            ) : (
              <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} data={product} />
                  ))
                ) : (
                  <p className="col-span-full text-black/60 py-12 text-center">
                    No products yet. Add products from the admin.
                  </p>
                )}
              </div>
            )}
            <hr className="border-t-black/10" />
            {!viewBrands && (
            <Pagination className="justify-between">
              <PaginationPrevious
                href={page > 1 ? `/shop${buildShopQuery(params, page - 1)}` : "#"}
                className="border border-black/10"
                aria-disabled={page <= 1}
              />
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={p === page ? "#" : `/shop${buildShopQuery(params, p)}`}
                      className="text-black/50 font-medium text-sm"
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              <PaginationNext
                href={page < totalPages ? `/shop${buildShopQuery(params, page + 1)}` : "#"}
                className="border border-black/10"
                aria-disabled={page >= totalPages}
              />
            </Pagination>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
