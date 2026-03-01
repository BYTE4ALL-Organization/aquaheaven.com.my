"use client";

import React from "react";
import ProductDetails from "./ProductDetails";
import type { CategoryKey } from "@/lib/product-page-content";

type ProductDetailsContentProps = {
  categorySlugs?: string[];
  /** Override: use this template key instead of deriving from categorySlugs. */
  categoryKey?: CategoryKey;
  volumeMl?: number | null;
  weightKg?: number | null;
  dimensions?: string | null;
};

const ProductDetailsContent = ({
  categorySlugs = [],
  categoryKey: categoryKeyOverride,
  volumeMl,
  weightKg,
  dimensions,
}: ProductDetailsContentProps) => {
  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Product specifications
      </h3>
      <ProductDetails
        categorySlugs={categorySlugs}
        categoryKey={categoryKeyOverride}
        volumeMl={volumeMl}
        weightKg={weightKg}
        dimensions={dimensions}
      />
    </section>
  );
};

export default ProductDetailsContent;
