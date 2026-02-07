"use client";

import { setSizeSelection } from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

const SizeSelection = ({ sizes }: { sizes: string[] }) => {
  const { sizeSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (sizes.length > 0 && !sizes.includes(sizeSelection)) {
      dispatch(setSizeSelection(sizes[0]));
    }
  }, [sizes.join(","), sizeSelection, dispatch]);

  if (sizes.length === 0) return null;

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Choose Size{sizes.length > 1 ? "s" : ""}
      </span>
      <div className="flex items-center flex-wrap lg:gap-3">
        {sizes.map((size, index) => (
          <button
            key={`${size}-${index}`}
            type="button"
            className={cn([
              "bg-[#F0F0F0] flex items-center justify-center px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base rounded-full m-1 lg:m-0 max-h-[46px]",
              sizeSelection === size && "bg-black font-medium text-white",
            ])}
            onClick={() => dispatch(setSizeSelection(size))}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelection;
