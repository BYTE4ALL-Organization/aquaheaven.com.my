"use client";

import React from "react";
import PhotoSection from "./PhotoSection";
import { Product } from "@/types/product.types";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import ColorSelection from "./ColorSelection";
import SizeSelection from "./SizeSelection";
import AddToCardSection from "./AddToCardSection";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type ProductWithColor = Product & {
  color?: string;
  availableColors?: string[];
  availableSizes?: string[];
  description?: string | null;
};

/** Show color section when product has at least one color option. */
function getProductColors(data: ProductWithColor): string[] {
  if (data.availableColors && data.availableColors.length > 0) return data.availableColors;
  const single = data.color?.trim();
  return single ? [single] : [];
}

const Header = ({ data }: { data: ProductWithColor }) => {
  const { formatPrice } = useCurrency();
  const title = data.title ?? (data as { name?: string }).name ?? "Product";
  const discount = data.discount ?? { amount: 0, percentage: 0 };
  const productColors = getProductColors(data);
  const showColorSection = productColors.length > 0;
  const showSizeSection = Boolean(data.availableSizes && data.availableSizes.length > 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <PhotoSection data={data} />
        </div>
        <div>
          <h1
            className={cn([
              integralCF.className,
              "text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize",
            ])}
          >
            {title}
          </h1>
          <div className="flex items-center mb-3 sm:mb-3.5">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-50"
              size={25}
              readonly
            />
            <span className="text-black text-xs sm:text-sm ml-[11px] sm:ml-[13px] pb-0.5 sm:pb-0">
              {data.rating.toFixed(1)}
              <span className="text-black/60">/5</span>
            </span>
          </div>
          <div className="flex items-center space-x-2.5 sm:space-x-3 mb-5">
            {discount.percentage > 0 ? (
              <span className="font-bold text-black text-2xl sm:text-[32px]">
                {formatPrice(Math.round(data.price - (data.price * discount.percentage) / 100))}
              </span>
            ) : discount.amount > 0 ? (
              <span className="font-bold text-black text-2xl sm:text-[32px]">
                {formatPrice(data.price - discount.amount)}
              </span>
            ) : (
              <span className="font-bold text-black text-2xl sm:text-[32px]">
                {formatPrice(data.price)}
              </span>
            )}
            {discount.percentage > 0 && (
              <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                {formatPrice(data.price)}
              </span>
            )}
            {discount.amount > 0 && (
              <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                {formatPrice(data.price)}
              </span>
            )}
            {discount.percentage > 0 ? (
              <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                {`-${discount.percentage}%`}
              </span>
            ) : (
              discount.amount > 0 && (
                <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                  {`-${formatPrice(discount.amount)}`}
                </span>
              )
            )}
          </div>
          {typeof data.description === "string" && data.description.trim() && (
            <p className="text-sm sm:text-base text-black/60 mb-5">
              {data.description.trim()}
            </p>
          )}
          {showColorSection && (
            <>
              <hr className="h-[1px] border-t-black/10 mb-5" />
              <ColorSelection colors={productColors} />
              <hr className="h-[1px] border-t-black/10 my-5" />
            </>
          )}
          {showSizeSection && (
            <>
              <SizeSelection sizes={data.availableSizes!} />
              <hr className="h-[1px] border-t-black/10 my-5" />
            </>
          )}
          <hr className="hidden md:block h-[1px] border-t-black/10 my-5" />
          <AddToCardSection data={data} />
        </div>
      </div>
    </>
  );
};

export default Header;
