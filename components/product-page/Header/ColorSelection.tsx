"use client";

import type { Color } from "@/lib/features/products/productsSlice";
import {
  setColorSelection,
} from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { IoMdCheckmark } from "react-icons/io";

/** Map product color names to swatch Tailwind classes (no hardcoded list). */
const COLOR_NAME_TO_CODE: Record<string, string> = {
  brown: "bg-[#4F4631]",
  green: "bg-[#314F4A]",
  blue: "bg-[#31344F]",
  marine: "bg-[#1e3a5f]",
  aqua: "bg-[#3dd4d4]",
  bordeaux: "bg-[#722f37]",
  rubis: "bg-[#9b2335]",
  bubble: "bg-[#e8e0d5]",
  white: "bg-[#f5f5f5] border border-black/10",
  black: "bg-[#1a1a1a]",
  grey: "bg-[#6b7280]",
  gray: "bg-[#6b7280]",
  red: "bg-[#b91c1c]",
  navy: "bg-[#1e3a5f]",
  pink: "bg-[#ec4899]",
  yellow: "bg-[#eab308]",
  beige: "bg-[#d4b896]",
};

function colorNameToCode(name: string): string {
  const key = name.trim().toLowerCase();
  return COLOR_NAME_TO_CODE[key] ?? "bg-gray-400";
}

const ColorSelection = ({ colors }: { colors: string[] }) => {
  const { colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  const options: Color[] = colors.map((name) => ({
    name: name.trim(),
    code: colorNameToCode(name),
  }));

  useEffect(() => {
    if (colors.length === 0) return;
    const first = { name: colors[0].trim(), code: colorNameToCode(colors[0]) };
    const currentInList = colors.some((c) => c.trim() === colorSelection.name);
    if (!currentInList) dispatch(setColorSelection(first));
  }, [colors.join(","), colorSelection.name, dispatch]);

  if (options.length === 0) return null;

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Color{options.length > 1 ? "s" : ""}
      </span>
      <div className="flex items-center flex-wrap gap-3 sm:gap-4">
        {options.map((color, index) => (
          <button
            key={`${color.name}-${index}`}
            type="button"
            className={cn([
              color.code,
              "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center",
            ])}
            onClick={() => dispatch(setColorSelection(color))}
          >
            {colorSelection.name === color.name && (
              <IoMdCheckmark className="text-base text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelection;
