"use client";

import React from "react";
import { getCategoryKey, getSpecsForCategory, SpecItem } from "@/lib/product-page-content";
import type { CategoryKey } from "@/lib/product-page-content";

type ProductDetailsProps = {
  /** Category slugs from the product to pick specs set when categoryKey not set. */
  categorySlugs?: string[];
  /** Override: use this template key instead of deriving from categorySlugs. */
  categoryKey?: CategoryKey;
  /** Optional product volume in mL (integer). */
  volumeMl?: number | null;
  /** Optional product weight in kg (0.1–5). */
  weightKg?: number | null;
  /** Optional dimensions/size string (e.g. "50 x 70 cm"). */
  dimensions?: string | null;
};

const ProductDetails = ({
  categorySlugs = [],
  categoryKey: categoryKeyOverride,
  volumeMl,
  weightKg,
  dimensions,
}: ProductDetailsProps) => {
  const categoryKey = categoryKeyOverride ?? getCategoryKey(categorySlugs);
  const templateSpecs: SpecItem[] = getSpecsForCategory(categoryKey);

  // Merge template specs with product-specific values; add Volume/Weight/Size rows when present
  const hasVolume = volumeMl != null && !Number.isNaN(volumeMl);
  const hasWeight = weightKg != null && !Number.isNaN(weightKg) && weightKg >= 0.1 && weightKg <= 5;
  const hasDimensions = dimensions != null && String(dimensions).trim() !== "";

  const specsData: SpecItem[] = templateSpecs.map((item) => {
    const labelLower = item.label.toLowerCase();
    if (labelLower === "volume" && hasVolume) return { label: item.label, value: `${volumeMl} mL` };
    if (labelLower === "weight" && hasWeight) return { label: item.label, value: `${Number(weightKg)} kg` };
    if ((labelLower === "size" || labelLower === "dimensions") && hasDimensions) return { label: item.label, value: dimensions.trim() };
    return item;
  });

  // Append product-specific rows that are not in the template
  if (hasVolume && !specsData.some((s) => s.label.toLowerCase() === "volume")) {
    specsData.push({ label: "Volume", value: `${volumeMl} mL` });
  }
  if (hasWeight && !specsData.some((s) => s.label.toLowerCase() === "weight")) {
    specsData.push({ label: "Weight", value: `${Number(weightKg)} kg` });
  }
  if (hasDimensions && !specsData.some((s) => s.label.toLowerCase() === "size" || s.label.toLowerCase() === "dimensions")) {
    specsData.push({ label: "Size", value: dimensions.trim() });
  }

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
