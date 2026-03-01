"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import ProductDetailsContent from "./ProductDetailsContent";
import ReviewsContent from "./ReviewsContent";
import FaqContent from "./FaqContent";
import { Review } from "@/types/review.types";
import type { CategoryKey } from "@/lib/product-page-content";

type TabBtn = {
  id: number;
  label: string;
};

const tabBtnData: TabBtn[] = [
  {
    id: 1,
    label: "Product Details",
  },
  {
    id: 2,
    label: "Rating & Reviews",
  },
  {
    id: 3,
    label: "FAQs",
  },
];

type TabsProps = {
  productId?: string;
  productSlug?: string;
  reviews?: Review[];
  categorySlugs?: string[];
  /** Resolved template key for FAQ tab (from override or category). */
  faqCategoryKey?: CategoryKey;
  /** Resolved template key for Product details tab. */
  detailsCategoryKey?: CategoryKey;
  /** True only when user is logged in and has purchased this product. */
  canReview?: boolean;
  /** Optional product volume in mL (integer). */
  volumeMl?: number | null;
  /** Optional product weight in kg (0.1–5). */
  weightKg?: number | null;
  /** Optional dimensions/size string (e.g. "50 x 70 cm"). */
  dimensions?: string | null;
};

const Tabs = ({
  productId,
  productSlug,
  reviews = [],
  categorySlugs = [],
  faqCategoryKey,
  detailsCategoryKey,
  canReview = false,
  volumeMl,
  weightKg,
  dimensions,
}: TabsProps) => {
  const [active, setActive] = useState<number>(1);

  return (
    <div>
      <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
        {tabBtnData.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            type="button"
            className={cn([
              active === tab.id
                ? "border-black border-b-2 font-medium"
                : "border-b border-black/10 text-black/60 font-normal",
              "p-5 sm:p-6 rounded-none flex-1",
            ])}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="mb-12 sm:mb-16">
        {active === 1 && (
          <ProductDetailsContent
            categorySlugs={categorySlugs}
            categoryKey={detailsCategoryKey}
            volumeMl={volumeMl}
            weightKg={weightKg}
            dimensions={dimensions}
          />
        )}
        {active === 2 && (
          <ReviewsContent
            productId={productId}
            productSlug={productSlug}
            reviews={reviews}
            canReview={canReview}
          />
        )}
        {active === 3 && (
          <FaqContent
            categorySlugs={categorySlugs}
            categoryKey={faqCategoryKey}
          />
        )}
      </div>
    </div>
  );
};

export default Tabs;
