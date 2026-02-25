"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdCheckmark } from "react-icons/io";
import { cn } from "@/lib/utils";

/** Map DB color names to Tailwind background classes for round swatches */
const COLOR_TO_CLASS: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border border-black/20",
  red: "bg-red-600",
  blue: "bg-blue-600",
  navy: "bg-blue-900",
  green: "bg-green-600",
  yellow: "bg-yellow-300",
  orange: "bg-orange-600",
  pink: "bg-pink-600",
  purple: "bg-purple-600",
  cyan: "bg-cyan-400",
  gray: "bg-gray-500",
  grey: "bg-gray-500",
  beige: "bg-amber-100",
  brown: "bg-amber-800",
  gold: "bg-amber-500",
  silver: "bg-gray-400",
  mint: "bg-emerald-300",
  lavender: "bg-violet-300",
  coral: "bg-orange-400",
};

function getColorClass(name: string): string {
  const key = name.toLowerCase().trim().replace(/\s+/g, "-");
  return COLOR_TO_CLASS[key] ?? COLOR_TO_CLASS[key.replace(/-/g, "")] ?? "bg-gray-400";
}

type ColorsSectionProps = {
  colors: string[];
  selectedColor: string | null;
  buildUrl: (params: { color?: string }) => string;
};

const ColorsSection = ({ colors, selectedColor, buildUrl }: ColorsSectionProps) => {
  if (colors.length === 0) return null;

  return (
    <Accordion type="single" collapsible defaultValue="filter-colors">
      <AccordionItem value="filter-colors" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Towel Colors
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex space-2.5 flex-wrap md:grid grid-cols-5 gap-2.5">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              const bgClass = getColorClass(color);
              return (
                <a
                  key={color}
                  href={buildUrl({ color: isSelected ? undefined : color })}
                  className={cn(
                    bgClass,
                    "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center border border-black/20 shrink-0",
                    isSelected && "ring-2 ring-black ring-offset-2"
                  )}
                  title={color}
                  aria-label={`Color ${color}${isSelected ? " (selected)" : ""}`}
                >
                  {isSelected && (
                    <IoMdCheckmark
                      className={cn(
                        "text-base",
                        ["bg-white", "bg-yellow-300", "bg-amber-100", "bg-violet-300", "bg-emerald-300", "bg-orange-400", "bg-gray-400", "bg-cyan-400"].some((c) => bgClass.includes(c))
                          ? "text-black"
                          : "text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]"
                      )}
                    />
                  )}
                </a>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ColorsSection;
