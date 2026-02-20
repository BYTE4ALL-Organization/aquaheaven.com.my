"use client";

import CartCounter from "@/components/ui/CartCounter";
import React, { useState, useCallback } from "react";
import AddToCartBtn from "./AddToCartBtn";
import { Product } from "@/types/product.types";

const AddToCardSection = ({ data }: { data: Product }) => {
  const available = typeof data.quantity === "number" ? Math.max(0, data.quantity) : undefined;
  const maxQty = available != null ? available : undefined;
  const [quantity, setQuantityState] = useState<number>(() =>
    maxQty != null ? Math.min(1, maxQty) : 1
  );

  const setQuantity = useCallback(
    (value: number) => {
      const clamped =
        maxQty != null ? Math.min(Math.max(1, value), maxQty) : Math.max(1, value);
      setQuantityState(clamped);
    },
    [maxQty]
  );

  const effectiveQty = maxQty != null ? Math.min(quantity, maxQty) : quantity;
  const outOfStock = maxQty != null && maxQty < 1;

  return (
    <div className="fixed md:relative w-full bg-white border-t md:border-none border-black/5 bottom-0 left-0 p-4 md:p-0 z-10 flex items-center justify-between sm:justify-start md:justify-center">
      {!outOfStock && (
        <CartCounter
          initialValue={effectiveQty}
          onAdd={setQuantity}
          onRemove={setQuantity}
          max={maxQty}
        />
      )}
      <AddToCartBtn
        data={{ ...data, quantity: outOfStock ? 0 : effectiveQty }}
        availableQuantity={available}
      />
    </div>
  );
};

export default AddToCardSection;
