"use client";

import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

export type CategoryOption = {
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
};

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
        <div key={category.slug}>
          <Link
            href={buildUrl({ category: category.slug })}
            className={cn(
              "flex items-center justify-between py-2",
              selectedSlug === category.slug && "font-medium text-black"
            )}
          >
            {category.name} <MdKeyboardArrowRight />
          </Link>
          {category.children && category.children.length > 0 && (
            <div className="pl-3 border-l border-black/10 ml-1 space-y-0.5">
              {category.children.map((child) => (
                <Link
                  key={child.slug}
                  href={buildUrl({ category: child.slug })}
                  className={cn(
                    "flex items-center justify-between py-1.5 text-sm",
                    selectedSlug === child.slug && "font-medium text-black"
                  )}
                >
                  {child.name} <MdKeyboardArrowRight />
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoriesSection;
