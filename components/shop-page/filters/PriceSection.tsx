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
  /** When provided, slider is controlled by parent (fixes decreasing/range updates) */
  value?: [number, number];
  onRangeChange: (min: number, max: number) => void;
};

const PriceSection = ({
  priceMin,
  priceMax,
  valueMin,
  valueMax,
  value: controlledValue,
  onRangeChange,
}: PriceSectionProps) => {
  const { currencySymbol } = useCurrency();
  const effectiveMax = Math.max(priceMax, priceMin + (priceMin === priceMax ? 1 : 0));
  const defaultMin = valueMin > 0 ? valueMin : priceMin;
  const defaultMax = valueMax > 0 ? valueMax : effectiveMax;
  const sliderValue = controlledValue ?? [defaultMin, defaultMax];

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            min={priceMin}
            max={effectiveMax}
            step={1}
            value={sliderValue}
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
