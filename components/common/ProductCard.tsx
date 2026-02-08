"use client";

import React from "react";
import Rating from "../ui/Rating";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type ProductCardProps = {
  data: Product & { name?: string; slug?: string; thumbnail?: string; images?: string[]; reviews?: { rating: number }[] };
};

/** Slug for URL: use DB slug, or build from title/name. */
function productSlug(data: ProductCardProps["data"]): string {
  if (data.slug) return data.slug;
  const title = data.title ?? data.name ?? "";
  return String(title).split(" ").filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "") || String(data.id);
}

function productTitle(data: ProductCardProps["data"]): string {
  return String(data.title ?? data.name ?? "").trim() || "Product";
}

function productImage(data: ProductCardProps["data"]): string {
  if (data.srcUrl) return data.srcUrl;
  if (data.thumbnail) return data.thumbnail;
  const images = Array.isArray(data.images) ? data.images : [];
  return images[0] ?? "/images/placeholder.png";
}

function productDiscount(data: ProductCardProps["data"]): { amount: number; percentage: number } {
  return data.discount ?? { amount: 0, percentage: 0 };
}

function productRating(data: ProductCardProps["data"]): number {
  if (typeof data.rating === "number") return data.rating;
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((a, r) => a + (r?.rating ?? 0), 0);
  return sum / reviews.length;
}

const ProductCard = ({ data }: ProductCardProps) => {
  const title = productTitle(data);
  const slug = productSlug(data);
  const srcUrl = productImage(data);
  const discount = productDiscount(data);
  const rating = productRating(data);
  const { formatPrice } = useCurrency();

  return (
    <Link
      href={`/shop/product/${data.id}/${slug}`}
      className="flex flex-col items-start aspect-auto group"
    >
      <div className="bg-[#F0EEED] rounded-[13px] lg:rounded-[20px] w-full lg:max-w-[295px] aspect-square mb-2.5 xl:mb-4 overflow-hidden border border-transparent hover:border-brand/30 transition-colors">
        <Image
          src={srcUrl}
          width={295}
          height={298}
          className="rounded-md w-full h-full object-contain hover:scale-110 transition-all duration-500"
          alt={title}
          priority
        />
      </div>
      <strong className="text-[#1a1a1a] xl:text-xl">{title}</strong>
      <div className="flex items-end mb-1 xl:mb-2">
        <Rating
          initialValue={rating}
          allowFraction
          SVGclassName="inline-block"
          emptyClassName="fill-gray-50"
          size={19}
          readonly
        />
        <span className="text-[#1a1a1a] text-xs xl:text-sm ml-[11px] xl:ml-[13px] pb-0.5 xl:pb-0">
          {rating.toFixed(1)}
          <span className="text-[#1a1a1a]/60">/5</span>
        </span>
      </div>
      <div className="flex items-center space-x-[5px] xl:space-x-2.5">
        {discount.percentage > 0 ? (
          <span className="font-bold text-[#1a1a1a] text-xl xl:text-2xl">
            {formatPrice(Math.round(data.price - (data.price * discount.percentage) / 100))}
          </span>
        ) : discount.amount > 0 ? (
          <span className="font-bold text-[#1a1a1a] text-xl xl:text-2xl">
            {formatPrice(data.price - discount.amount)}
          </span>
        ) : (
          <span className="font-bold text-[#1a1a1a] text-xl xl:text-2xl">
            {formatPrice(data.price)}
          </span>
        )}
        {discount.percentage > 0 && (
          <span className="font-bold text-[#1a1a1a]/40 line-through text-xl xl:text-2xl">
            {formatPrice(data.price)}
          </span>
        )}
        {discount.amount > 0 && (
          <span className="font-bold text-[#1a1a1a]/40 line-through text-xl xl:text-2xl">
            {formatPrice(data.price)}
          </span>
        )}
        {discount.percentage > 0 ? (
          <span className="font-medium text-[10px] xl:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
            {`-${discount.percentage}%`}
          </span>
        ) : (
          discount.amount > 0 && (
            <span className="font-medium text-[10px] xl:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
              {`-${formatPrice(discount.amount)}`}
            </span>
          )
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
