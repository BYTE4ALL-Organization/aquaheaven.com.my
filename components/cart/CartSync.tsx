"use client";

import { useUser } from "@stackframe/stack";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { setCartFromServer } from "@/lib/features/carts/cartsSlice";
import type { CartItem } from "@/lib/features/carts/cartsSlice";
import { useCallback, useEffect, useRef } from "react";

/** Map API cart item (product + quantity) to CartItem for Redux. */
function mapApiCartItemToCartItem(apiItem: {
  id: string;
  name: string;
  slug?: string;
  price: unknown;
  thumbnail?: string | null;
  images?: string[];
  quantity: number;
  availableQuantity?: number;
}): CartItem {
  const price = Number(apiItem.price) || 0;
  const srcUrl =
    apiItem.thumbnail ||
    (Array.isArray(apiItem.images) && apiItem.images[0]) ||
    "/images/placeholder.png";
  return {
    id: apiItem.id,
    name: apiItem.name,
    srcUrl,
    price,
    attributes: [],
    discount: { amount: 0, percentage: 0 },
    quantity: apiItem.quantity,
    availableQuantity: apiItem.availableQuantity,
    ...(apiItem.slug && { slug: apiItem.slug }),
  };
}

/**
 * When the user is signed in:
 * - Load their saved cart from the API and hydrate Redux (so cart survives logout → login).
 * - When local cart changes, persist it to the API (debounced).
 */
export default function CartSync() {
  const user = useUser({ or: "return-null" });
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.carts.cart);
  const loadedForUser = useRef<string | null>(null);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load cart from API when user logs in (or on mount if already logged in).
  useEffect(() => {
    if (!user?.id) {
      loadedForUser.current = null;
      return;
    }
    if (loadedForUser.current === user.id) return;
    loadedForUser.current = user.id;

    fetch("/api/shop/cart", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.items)) return;
        const items: CartItem[] = data.items.map(mapApiCartItemToCartItem);
        dispatch(setCartFromServer(items));
      })
      .catch(() => {
        loadedForUser.current = null;
      });
  }, [user?.id, dispatch]);

  // Persist cart to API when user is logged in and cart changes (debounced).
  const syncCartToServer = useCallback(() => {
    if (!user?.id || !cart?.items?.length) return;
    const itemsWithSlug = cart.items.filter((item): item is typeof item & { slug: string } => Boolean(item.slug));
    if (itemsWithSlug.length === 0) return;

    fetch("/api/shop/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: itemsWithSlug.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
        })),
      }),
    }).catch(() => {});
  }, [user?.id, cart?.items]);

  useEffect(() => {
    if (!user?.id) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(syncCartToServer, 800);
    return () => {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
    };
  }, [user?.id, cart?.items, syncCartToServer]);

  return null;
}
