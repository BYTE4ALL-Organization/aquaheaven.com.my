"use client";

import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

export type CategoryOption = { name: string; slug: string };

type CategoriesSectionProps = {
  categories: CategoryOption[];
  selectedSlug: string | null;
  buildUrl: (params: { category?: string }) => string;
};

const CategoriesSection = ({ categories, selectedSlug, buildUrl }: CategoriesSectionProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      <Link
        href={buildUrl({ category: "" })}
        className={cn(
          "flex items-center justify-between py-2",
          !selectedSlug && "font-medium text-black"
        )}
      >
        All categories <MdKeyboardArrowRight />
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={buildUrl({ category: category.slug })}
          className={cn(
            "flex items-center justify-between py-2",
            selectedSlug === category.slug && "font-medium text-black"
          )}
        >
          {category.name} <MdKeyboardArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default CategoriesSection;
