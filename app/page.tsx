import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { Product } from "@/types/product.types";
import { Review } from "@/types/review.types";

async function getNewArrivals(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = new URL(`${baseUrl}/api/shop/products`);
    url.searchParams.set("limit", "4");
    url.searchParams.set("sortBy", "createdAt");
    url.searchParams.set("order", "desc");

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

async function getTopSelling(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = new URL(`${baseUrl}/api/shop/products`);
    url.searchParams.set("limit", "4");
    url.searchParams.set("featured", "true");
    url.searchParams.set("sortBy", "createdAt");
    url.searchParams.set("order", "desc");

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error("Error fetching top selling:", error);
    return [];
  }
}

async function getReviewsFromDb(): Promise<Review[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/shop/reviews`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.success && Array.isArray(data.reviews) ? data.reviews : [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export default async function Home() {
  const [newArrivalsData, topSellingData, reviewsFromDb] = await Promise.all([
    getNewArrivals(),
    getTopSelling(),
    getReviewsFromDb(),
  ]);

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        {newArrivalsData.length > 0 && (
          <ProductListSec
            title="BEST SELLERS"
            data={newArrivalsData}
            viewAllLink="/shop#new-arrivals"
          />
        )}
        {newArrivalsData.length > 0 && (
          <div className="max-w-frame mx-auto px-4 xl:px-0">
            <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
          </div>
        )}
        {topSellingData.length > 0 && (
          <div className="mb-[50px] sm:mb-20">
            <ProductListSec
              title="top selling"
              data={topSellingData}
              viewAllLink="/shop#top-selling"
            />
          </div>
        )}
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        {reviewsFromDb.length > 0 && <Reviews data={reviewsFromDb} />}
      </main>
    </>
  );
}
