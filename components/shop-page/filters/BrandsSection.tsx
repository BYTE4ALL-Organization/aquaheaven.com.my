"use client";

import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

export type BrandOption = { name: string; slug: string };

type BrandsSectionProps = {
  brands: BrandOption[];
  selectedSlug: string | null;
  buildUrl: (params: { brand?: string }) => string;
};

const BrandsSection = ({ brands, selectedSlug, buildUrl }: BrandsSectionProps) => {
  if (brands.length === 0) return null;

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      <Link
        href={buildUrl({ brand: "" })}
        className={cn(
          "flex items-center justify-between py-2",
          !selectedSlug && "font-medium text-black"
        )}
      >
        All brands <MdKeyboardArrowRight />
      </Link>
      {brands.map((b) => (
        <Link
          key={b.slug}
          href={buildUrl({ brand: b.slug })}
          className={cn(
            "flex items-center justify-between py-2",
            selectedSlug === b.slug && "font-medium text-black"
          )}
        >
          {b.name} <MdKeyboardArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default BrandsSection;
