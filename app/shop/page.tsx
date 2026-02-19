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
import { getBaseUrl } from "@/lib/base-url";
import { Product } from "@/types/product.types";

function mapApiProductToCard(apiProduct: {
  id: string;
  name: string;
  slug: string;
  price: unknown;
  thumbnail?: string | null;
  images?: string[];
  reviews?: { rating: number }[];
}): Product & { name?: string; slug?: string; thumbnail?: string; images?: string[]; reviews?: { rating: number }[] } {
  const reviews = Array.isArray(apiProduct.reviews) ? apiProduct.reviews : [];
  const rating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + (r?.rating ?? 0), 0) / reviews.length
      : 0;
  return {
    id: apiProduct.id as unknown as number,
    title: apiProduct.name,
    name: apiProduct.name,
    slug: apiProduct.slug,
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

function buildShopQuery(params: Record<string, string | string[] | undefined>, page: number): string {
  const q = new URLSearchParams();
  const category = typeof params?.category === "string" ? params.category : undefined;
  const brand = typeof params?.brand === "string" ? params.brand : undefined;
  const color = typeof params?.color === "string" ? params.color : undefined;
  const size = typeof params?.size === "string" ? params.size : undefined;
  const minPrice = typeof params?.minPrice === "string" ? params.minPrice : undefined;
  const maxPrice = typeof params?.maxPrice === "string" ? params.maxPrice : undefined;
  if (category) q.set("category", category);
  if (brand) q.set("brand", brand);
  if (color) q.set("color", color);
  if (size) q.set("size", size);
  if (minPrice) q.set("minPrice", minPrice);
  if (maxPrice) q.set("maxPrice", maxPrice);
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
  const page = Math.max(1, parseInt(typeof params?.page === "string" ? params.page : "", 10) || 1);
  const offset = (page - 1) * PER_PAGE;

  const baseUrl = getBaseUrl();

  const [filtersRes, productsRes] = await Promise.all([
    fetch(`${baseUrl}/api/shop/filters`, { cache: "no-store" }),
    (() => {
      const url = new URL(`${baseUrl}/api/shop/products`);
      url.searchParams.set("limit", String(PER_PAGE));
      url.searchParams.set("offset", String(offset));
      if (category) url.searchParams.set("category", category);
      if (brand) url.searchParams.set("brand", brand);
      if (color) url.searchParams.set("color", color);
      if (size) url.searchParams.set("size", size);
      if (minPrice) url.searchParams.set("minPrice", minPrice);
      if (maxPrice) url.searchParams.set("maxPrice", maxPrice);
      return fetch(url.toString(), { cache: "no-store" });
    })(),
  ]);

  const filtersData = filtersRes.ok ? await filtersRes.json() : null;
  const productsData = productsRes.ok ? await productsRes.json() : null;

  const options = filtersData?.success
    ? {
        categories: filtersData.categories ?? [],
        brands: filtersData.brands ?? [],
        priceRange: filtersData.priceRange ?? { min: 0, max: 250 },
        colors: filtersData.colors ?? [],
        sizes: filtersData.sizes ?? [],
      }
    : {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 250 },
        colors: [],
        sizes: [],
      };

  const products: (Product & { name?: string; slug?: string; thumbnail?: string; images?: string[]; reviews?: { rating: number }[] })[] =
    productsData?.success && Array.isArray(productsData?.products)
      ? productsData.products.map(mapApiProductToCard)
      : [];
  const total = typeof productsData?.total === "number" ? productsData.total : products.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const start = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, total);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
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
                <h1 className="font-bold text-2xl md:text-[32px] text-black">Shop</h1>
                <MobileFilters options={options} />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {total === 0 ? 0 : start}–{end} of {total} products
                </span>
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
              </div>
            </div>
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
            <hr className="border-t-black/10" />
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
          </div>
        </div>
      </div>
    </main>
  );
}
