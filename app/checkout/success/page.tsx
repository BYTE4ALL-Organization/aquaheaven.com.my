"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

/**
 * When the user lands here after paying on Billplz (redirect_url), we sync
 * payment status with Billplz in case the webhook did not fire. That updates
 * the order to CONFIRMED and sends the confirmation email.
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [syncing, setSyncing] = useState(!!orderId);

  useEffect(() => {
    if (!orderId?.trim()) {
      setSyncing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/shop/orders/${encodeURIComponent(orderId)}/sync-payment`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setSyncing(false);
        }
      } catch {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0 py-12 text-center">
        <h2
          className={cn([
            integralCF.className,
            "font-bold text-[32px] md:text-[40px] text-black uppercase mb-4",
          ])}
        >
          Thank you
        </h2>
        {syncing ? (
          <p className="text-black/60 mb-8">Confirming your payment…</p>
        ) : (
          <>
            <p className="text-black/70 mb-2">
              Your payment has been received.
              {orderId && (
                <span className="block mt-2 text-sm">
                  Order reference: <strong>{orderId}</strong>
                </span>
              )}
            </p>
            <p className="text-black/60 text-sm mb-8">
              We will process your order and notify you when it ships.
            </p>
          </>
        )}
        <Button asChild className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </main>
  );
}
