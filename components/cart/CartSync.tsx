"use client";

import { useUser } from "@stackframe/stack";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { setCartFromServer } from "@/lib/features/carts/cartsSlice";
import type { CartItem } from "@/lib/features/carts/cartsSlice";
import { useCallback, useEffect, useRef } from "react";

type ApiCartItem = {
  id: string;
  name: string;
  slug?: string;
  price: unknown;
  thumbnail?: string | null;
  images?: string[];
  quantity: number;
  availableQuantity?: number;
  brand?: string;
};

/** Map one API cart item to CartItem for Redux. */
function mapApiCartItemToCartItem(apiItem: ApiCartItem): CartItem {
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
    ...(apiItem.brand && { brand: apiItem.brand }),
  };
}

/** Merge API items by product id so one CartItem per product (sum quantities). Prevents doubled display when DB has duplicate rows. */
function mergeApiCartItems(apiItems: ApiCartItem[]): CartItem[] {
  const byId = new Map<string, { item: ApiCartItem; quantity: number }>();
  for (const apiItem of apiItems) {
    const id = String(apiItem.id);
    const qty = apiItem.quantity;
    const existing = byId.get(id);
    if (existing) {
      existing.quantity += qty;
    } else {
      byId.set(id, { item: apiItem, quantity: qty });
    }
  }
  return Array.from(byId.values()).map(({ item, quantity }) =>
    mapApiCartItemToCartItem({ ...item, quantity })
  );
}

/** Merge server cart with guest cart (same product id => sum quantities; guest-only items appended). */
function mergeGuestCartWithServer(serverItems: CartItem[], guestItems: CartItem[]): CartItem[] {
  const byId = new Map<string, CartItem>();
  for (const item of serverItems) {
    byId.set(String(item.id), { ...item });
  }
  for (const item of guestItems) {
    const id = String(item.id);
    const existing = byId.get(id);
    if (existing) {
      existing.quantity = (existing.quantity ?? 0) + (item.quantity ?? 0);
      if (item.slug && !existing.slug) existing.slug = item.slug;
      if (item.availableQuantity != null) existing.availableQuantity = item.availableQuantity;
    } else {
      byId.set(id, { ...item });
    }
  }
  return Array.from(byId.values());
}

/** Persists across remounts (e.g. navigation, Strict Mode). Ensures we only merge guest+server once per user; later loads just replace with server. */
let loadedForUserId: string | null = null;

/**
 * When the user is signed in:
 * - Load their saved cart from the API and hydrate Redux (so cart survives logout → login).
 * - When local cart changes, persist it to the API (debounced).
 */
export default function CartSync() {
  const user = useUser({ or: "return-null" });
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.carts.cart);
  const prevUserId = useRef<string | null>(null);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  // When user logs out (had id, now null), clear cart and module-level flag so next login does a fresh merge.
  useEffect(() => {
    const hadUser = prevUserId.current != null;
    const hasUser = user?.id != null;
    prevUserId.current = user?.id ?? null;
    if (!hasUser) {
      loadedForUserId = null;
      if (hadUser) dispatch(setCartFromServer([]));
    }
  }, [user?.id, dispatch]);

  // On login (or remount while logged in): fetch server cart. Only merge with guest on first load for this user; otherwise replace with server to avoid doubling.
  useEffect(() => {
    if (!user?.id) return;
    const isFirstLoadForUser = loadedForUserId !== user.id;
    if (isFirstLoadForUser) loadedForUserId = user.id;
    const guestItems = cartRef.current?.items ?? [];

    fetch("/api/shop/cart", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.items)) {
          if (guestItems.length > 0 && isFirstLoadForUser)
            dispatch(setCartFromServer(mergeGuestCartWithServer([], guestItems)));
          return;
        }
        const serverItems = mergeApiCartItems(data.items);
        const merged = isFirstLoadForUser
          ? mergeGuestCartWithServer(serverItems, guestItems)
          : serverItems;
        dispatch(setCartFromServer(merged));
      })
      .catch(() => {
        if (isFirstLoadForUser) loadedForUserId = null;
        if (guestItems.length > 0 && isFirstLoadForUser)
          dispatch(setCartFromServer(mergeGuestCartWithServer([], guestItems)));
      });
  }, [user?.id, dispatch]);

  // Persist cart to API when user is logged in and cart changes (debounced).
  // Group by slug and sum quantities so we never create duplicate cart_items per product.
  const syncCartToServer = useCallback(() => {
    if (!user?.id || !cart?.items?.length) return;
    const itemsWithSlug = cart.items.filter((item): item is typeof item & { slug: string } => Boolean(item.slug));
    if (itemsWithSlug.length === 0) return;

    const bySlug = new Map<string, number>();
    for (const item of itemsWithSlug) {
      const q = bySlug.get(item.slug) ?? 0;
      bySlug.set(item.slug, q + item.quantity);
    }
    const items = Array.from(bySlug.entries()).map(([slug, quantity]) => ({ slug, quantity }));

    fetch("/api/shop/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
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
