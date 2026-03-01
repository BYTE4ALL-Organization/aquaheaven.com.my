"use client";

import React from "react";
import { getCategoryKey, getSpecsForCategory, SpecItem } from "@/lib/product-page-content";
import type { CategoryKey } from "@/lib/product-page-content";

type ProductDetailsProps = {
  /** Category slugs from the product to pick specs set when categoryKey not set. */
  categorySlugs?: string[];
  /** Override: use this template key instead of deriving from categorySlugs. */
  categoryKey?: CategoryKey;
};

const ProductDetails = ({ categorySlugs = [], categoryKey: categoryKeyOverride }: ProductDetailsProps) => {
  const categoryKey = categoryKeyOverride ?? getCategoryKey(categorySlugs);
  const specsData: SpecItem[] = getSpecsForCategory(categoryKey);

  return (
    <>
      {specsData.map((item, i) => (
        <div className="grid grid-cols-3" key={i}>
          <div>
            <p className="text-sm py-3 w-full leading-7 lg:py-4 pr-2 text-neutral-500">
              {item.label}
            </p>
          </div>
          <div className="col-span-2 py-3 lg:py-4 border-b">
            <p className="text-sm w-full leading-7 text-neutral-800 font-medium">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductDetails;
