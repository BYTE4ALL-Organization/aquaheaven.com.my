"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type SizeSectionProps = {
  sizes: string[];
  selectedSize: string | null;
  buildUrl: (params: { size?: string }) => string;
};

const SizeSection = ({ sizes, selectedSize, buildUrl }: SizeSectionProps) => {
  if (sizes.length === 0) return null;

  return (
    <Accordion type="single" collapsible defaultValue="filter-size">
      <AccordionItem value="filter-size" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Size
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <a
                  key={size}
                  href={buildUrl({ size: isSelected ? undefined : size })}
                  className={cn(
                    "flex items-center justify-center px-5 py-2.5 text-sm rounded-full max-h-[39px]",
                    isSelected
                      ? "bg-black font-medium text-white"
                      : "bg-[#F0F0F0] hover:bg-black/10"
                  )}
                >
                  {size}
                </a>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SizeSection;
