"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type PriceSectionProps = {
  priceMin: number;
  priceMax: number;
  valueMin: number;
  valueMax: number;
  onRangeChange: (min: number, max: number) => void;
};

const PriceSection = ({
  priceMin,
  priceMax,
  valueMin,
  valueMax,
  onRangeChange,
}: PriceSectionProps) => {
  const { currencySymbol } = useCurrency();
  const effectiveMax = Math.max(priceMax, priceMin + (priceMin === priceMax ? 1 : 0));
  const defaultMin = valueMin > 0 ? valueMin : priceMin;
  const defaultMax = valueMax > 0 ? valueMax : effectiveMax;

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            key={`${defaultMin}-${defaultMax}`}
            min={priceMin}
            max={effectiveMax}
            step={1}
            defaultValue={[defaultMin, defaultMax]}
            label={currencySymbol}
            onValueChange={(v) => onRangeChange(v[0], v[1])}
          />
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
